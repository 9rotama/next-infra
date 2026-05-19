data "archive_file" "server" {
  type        = "zip"
  source_dir  = local.server_src
  output_path = "${path.module}/.terraform/tmp/server.zip"
}

data "archive_file" "image" {
  type        = "zip"
  source_dir  = local.image_src
  output_path = "${path.module}/.terraform/tmp/image.zip"
}

data "archive_file" "revalidation" {
  type        = "zip"
  source_dir  = local.revalidation_src
  output_path = "${path.module}/.terraform/tmp/revalidation.zip"
}

data "archive_file" "dynamodb_provider" {
  type        = "zip"
  source_dir  = local.dynamodb_src
  output_path = "${path.module}/.terraform/tmp/dynamodb-provider.zip"
}

locals {
  cache_env = {
    CACHE_BUCKET_NAME         = aws_s3_bucket.assets.bucket
    CACHE_BUCKET_KEY_PREFIX   = local.cache_key_prefix
    CACHE_BUCKET_REGION       = var.region
    CACHE_DYNAMO_TABLE        = aws_dynamodb_table.cache.name
    REVALIDATION_QUEUE_URL    = aws_sqs_queue.revalidation.url
    REVALIDATION_QUEUE_REGION = var.region
  }
}

# ---- server (SSR / Server Actions / Route Handlers) ----
resource "aws_lambda_function" "server" {
  function_name    = "${local.name_prefix}-server"
  role             = aws_iam_role.server.arn
  filename         = data.archive_file.server.output_path
  source_code_hash = data.archive_file.server.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  architectures    = [var.lambda_architecture]
  memory_size      = var.server_memory
  timeout          = 30

  environment {
    variables = local.cache_env
  }
}

resource "aws_lambda_function_url" "server" {
  function_name = aws_lambda_function.server.function_name
  # Server Actions/POST は body 付きで OAC SigV4 署名と両立しないため公開。
  authorization_type = "NONE"
  invoke_mode        = "RESPONSE_STREAM" # open-next.config.ts の aws-lambda-streaming と対
}

# ---- image optimization ----
resource "aws_lambda_function" "image" {
  function_name    = "${local.name_prefix}-image"
  role             = aws_iam_role.image.arn
  filename         = data.archive_file.image.output_path
  source_code_hash = data.archive_file.image.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  architectures    = [var.lambda_architecture]
  memory_size      = var.image_memory
  timeout          = 30

  environment {
    variables = {
      BUCKET_NAME       = aws_s3_bucket.assets.bucket
      BUCKET_KEY_PREFIX = "" # アセットはバケット直下
    }
  }
}

resource "aws_lambda_function_url" "image" {
  function_name      = aws_lambda_function.image.function_name
  authorization_type = "AWS_IAM" # CloudFront OAC が SigV4 署名して呼ぶ
  invoke_mode        = "BUFFERED"
}

# ---- revalidation (SQS 消費で ISR 再生成) ----
resource "aws_lambda_function" "revalidation" {
  function_name    = "${local.name_prefix}-revalidation"
  role             = aws_iam_role.revalidation.arn
  filename         = data.archive_file.revalidation.output_path
  source_code_hash = data.archive_file.revalidation.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  architectures    = [var.lambda_architecture]
  memory_size      = var.revalidation_memory
  timeout          = 30

  environment {
    variables = local.cache_env
  }
}

resource "aws_lambda_event_source_mapping" "revalidation" {
  event_source_arn = aws_sqs_queue.revalidation.arn
  function_name    = aws_lambda_function.revalidation.arn
  batch_size       = 5
}

# ---- dynamodb-provider (タグキャッシュ初期化、デプロイ後に1回 invoke) ----
resource "aws_lambda_function" "dynamodb_provider" {
  function_name    = "${local.name_prefix}-ddb-provider"
  role             = aws_iam_role.dynamodb_provider.arn
  filename         = data.archive_file.dynamodb_provider.output_path
  source_code_hash = data.archive_file.dynamodb_provider.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  architectures    = [var.lambda_architecture]
  memory_size      = 512
  timeout          = 300

  environment {
    variables = {
      CACHE_DYNAMO_TABLE = aws_dynamodb_table.cache.name
    }
  }
}

# server: Server Actions(POST) のため公開 (AuthType=NONE)。
# 2025-10 以降の Function URL は InvokeFunctionUrl と InvokeFunction の両方が必須
# (AWS: Control access to Lambda function URLs)。欠けると AuthType=NONE でも 403。
resource "aws_lambda_permission" "server_url" {
  statement_id           = "AllowPublicInvokeServerUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.server.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_permission" "server_invoke" {
  statement_id  = "AllowPublicInvokeServerFn"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.server.function_name
  principal     = "*"
}

# image: GET 専用なので CloudFront OAC (SigV4) で非公開維持。

resource "aws_lambda_permission" "image_url" {
  statement_id           = "AllowCloudFrontImage"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.image.function_name
  principal              = "cloudfront.amazonaws.com"
  source_arn             = aws_cloudfront_distribution.main.arn
  function_url_auth_type = "AWS_IAM"
}

# OAC 署名リクエストには InvokeFunctionUrl に加えて InvokeFunction も必要
# (AWS ドキュメント: Restrict access to a Lambda function URL origin)。image のみ。
resource "aws_lambda_permission" "image_invoke" {
  statement_id  = "AllowCloudFrontImageInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image.function_name
  principal     = "cloudfront.amazonaws.com"
  source_arn    = aws_cloudfront_distribution.main.arn
}
