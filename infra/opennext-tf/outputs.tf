output "region" {
  value = var.region
}

output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "cloudfront_domain" {
  description = "CloudFront のドメイン (HTTPS、本番経路)"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "assets_bucket" {
  value = aws_s3_bucket.assets.bucket
}

output "cache_key_prefix" {
  value = local.cache_key_prefix
}

output "dynamodb_table" {
  value = aws_dynamodb_table.cache.name
}

output "server_function" {
  value = aws_lambda_function.server.function_name
}

output "image_function" {
  value = aws_lambda_function.image.function_name
}

output "revalidation_function" {
  value = aws_lambda_function.revalidation.function_name
}

output "dynamodb_provider_function" {
  value = aws_lambda_function.dynamodb_provider.function_name
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.main.id
}
