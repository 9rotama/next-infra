# 静的アセット + ISR/fetch キャッシュを格納する S3 バケット。
# アセットは CloudFront(OAC) から読み取り、キャッシュは server/revalidation Lambda が読み書きする。
resource "aws_s3_bucket" "assets" {
  bucket        = "${local.name_prefix}-assets-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront ディストリビューションだけにバケット読み取りを許可する OAC ポリシー。
data "aws_iam_policy_document" "assets_bucket" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.assets.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.main.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id
  policy = data.aws_iam_policy_document.assets_bucket.json
}

# ISR タグキャッシュ用 DynamoDB (OpenNext 既定スキーマ: path / tag / revalidatedAt + GSI)。
resource "aws_dynamodb_table" "cache" {
  name         = "${local.name_prefix}-cache"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "path"
  range_key    = "tag"

  attribute {
    name = "path"
    type = "S"
  }

  attribute {
    name = "tag"
    type = "S"
  }

  attribute {
    name = "revalidatedAt"
    type = "N"
  }

  global_secondary_index {
    name            = "revalidate"
    hash_key        = "tag"
    range_key       = "revalidatedAt"
    projection_type = "ALL"
  }
}

# 再生成リクエストを server → revalidation Lambda へ渡す FIFO キュー。
resource "aws_sqs_queue" "revalidation" {
  name                        = "${local.name_prefix}-revalidation.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 30
  message_retention_seconds   = 86400
}
