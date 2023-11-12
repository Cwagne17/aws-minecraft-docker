variable "project_name" {
  type        = string
  description = "The name of the project."
}

variable "create_vpc" {
  type        = bool
  description = "Whether or not to create a VPC."
  default     = true
}

variable "create_bucket" {
  type        = bool
  description = "Whether or not to create an S3 backups bucket."
  default     = true
}

variable "instance_type" {
  type        = string
  description = "The type of instance to start."
  default     = "t2.micro"
}
