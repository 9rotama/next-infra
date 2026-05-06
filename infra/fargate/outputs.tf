output "region" {
  value = var.region
}

output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "alb_dns" {
  description = "ALB の DNS 名 (HTTP 直接アクセス用、デバッグ向け)"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain" {
  description = "CloudFront のドメイン (HTTPS、本番経路)"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "ecs_cluster" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service" {
  value = aws_ecs_service.app.name
}

output "log_group" {
  value = aws_cloudwatch_log_group.app.name
}
