# Lambda が AssumeRole できる信頼ポリシー (全関数共通)。
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# CloudWatch Logs への書き込み (Basic Execution 相当)。
locals {
  logs_arn = "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:*"
}

# ---- server Lambda ----
resource "aws_iam_role" "server" {
  name               = "${local.name_prefix}-server"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "server" {
  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = [local.logs_arn]
  }
  statement {
    sid       = "S3Cache"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket", "s3:DeleteObject"]
    resources = [aws_s3_bucket.assets.arn, "${aws_s3_bucket.assets.arn}/*"]
  }
  statement {
    sid       = "Dynamo"
    actions   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query", "dynamodb:BatchWriteItem", "dynamodb:BatchGetItem"]
    resources = [aws_dynamodb_table.cache.arn, "${aws_dynamodb_table.cache.arn}/index/*"]
  }
  statement {
    sid       = "Queue"
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.revalidation.arn]
  }
}

resource "aws_iam_role_policy" "server" {
  role   = aws_iam_role.server.id
  policy = data.aws_iam_policy_document.server.json
}

# ---- image optimization Lambda ----
resource "aws_iam_role" "image" {
  name               = "${local.name_prefix}-image"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "image" {
  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = [local.logs_arn]
  }
  statement {
    sid       = "S3Read"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.assets.arn}/*"]
  }
}

resource "aws_iam_role_policy" "image" {
  role   = aws_iam_role.image.id
  policy = data.aws_iam_policy_document.image.json
}

# ---- revalidation Lambda ----
resource "aws_iam_role" "revalidation" {
  name               = "${local.name_prefix}-revalidation"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "revalidation" {
  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = [local.logs_arn]
  }
  statement {
    sid       = "Queue"
    actions   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
    resources = [aws_sqs_queue.revalidation.arn]
  }
  statement {
    sid       = "S3Cache"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket", "s3:DeleteObject"]
    resources = [aws_s3_bucket.assets.arn, "${aws_s3_bucket.assets.arn}/*"]
  }
  statement {
    sid       = "Dynamo"
    actions   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query", "dynamodb:BatchWriteItem"]
    resources = [aws_dynamodb_table.cache.arn, "${aws_dynamodb_table.cache.arn}/index/*"]
  }
}

resource "aws_iam_role_policy" "revalidation" {
  role   = aws_iam_role.revalidation.id
  policy = data.aws_iam_policy_document.revalidation.json
}

# ---- dynamodb-provider (タグキャッシュ初期化) Lambda ----
resource "aws_iam_role" "dynamodb_provider" {
  name               = "${local.name_prefix}-ddb-provider"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "dynamodb_provider" {
  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = [local.logs_arn]
  }
  statement {
    sid       = "Dynamo"
    actions   = ["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:BatchWriteItem", "dynamodb:DescribeTable"]
    resources = [aws_dynamodb_table.cache.arn]
  }
}

resource "aws_iam_role_policy" "dynamodb_provider" {
  role   = aws_iam_role.dynamodb_provider.id
  policy = data.aws_iam_policy_document.dynamodb_provider.json
}
