data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

# Lambda Function URL は Host ヘッダに自身のドメインを要求するため Host を転送しない。
data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}

# 画像最適化はクエリ文字列 (url/w/q) をオリジンに渡しつつキャッシュキーに含める必要がある。
resource "aws_cloudfront_cache_policy" "image" {
  name        = "${local.name_prefix}-image"
  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Accept"]
      }
    }
    query_strings_config {
      query_string_behavior = "all"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# S3 アセットバケットへ CloudFront からのみ署名付きでアクセスする OAC。
resource "aws_cloudfront_origin_access_control" "assets" {
  name                              = "${local.name_prefix}-assets"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

locals {
  server_domain = replace(replace(aws_lambda_function_url.server.function_url, "https://", ""), "/", "")
  image_domain  = replace(replace(aws_lambda_function_url.image.function_url, "https://", ""), "/", "")
}

resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  is_ipv6_enabled = true
  http_version    = "http2and3"
  comment         = "${local.name_prefix} CDN"
  price_class     = "PriceClass_200"

  origin {
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id                = "s3-assets"
    origin_access_control_id = aws_cloudfront_origin_access_control.assets.id
  }

  origin {
    domain_name = local.server_domain
    origin_id   = "lambda-server"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    domain_name = local.image_domain
    origin_id   = "lambda-image"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # 既定: SSR / Server Actions / Route Handlers → server Lambda
  default_cache_behavior {
    target_origin_id       = "lambda-server"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
  }

  # ビルド済み静的アセット → S3
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = "s3-assets"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = data.aws_cloudfront_cache_policy.optimized.id
  }

  # 画像最適化 → image Lambda
  ordered_cache_behavior {
    path_pattern           = "/_next/image*"
    target_origin_id       = "lambda-image"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id          = aws_cloudfront_cache_policy.image.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
