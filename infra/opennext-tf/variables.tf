variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "project" {
  description = "Project name prefix"
  type        = string
  default     = "next-infra"
}

variable "stack" {
  description = "Stack identifier (used in resource names)"
  type        = string
  default     = "opennext-tf"
}

variable "open_next_dir" {
  description = "Path to the .open-next build output (relative to this module)"
  type        = string
  default     = "../../app/.open-next"
}

variable "server_memory" {
  description = "Server Lambda memory (MB)"
  type        = number
  default     = 1024
}

variable "image_memory" {
  description = "Image optimization Lambda memory (MB)"
  type        = number
  default     = 1536
}

variable "revalidation_memory" {
  description = "Revalidation Lambda memory (MB)"
  type        = number
  default     = 512
}

variable "lambda_architecture" {
  description = "Lambda architecture (must match the open-next build, default x86_64)"
  type        = string
  default     = "x86_64"
}
