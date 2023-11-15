# Required variables

variable "project_name" {
  type        = string
  description = "The name of the project."
}


# Optional variables

variable "create_bucket" {
  type        = bool
  description = "Whether or not to create an S3 backups bucket."
  default     = true
}

variable "instance_ami" {
  type        = string
  description = "The AMI to use for the instance."
  default     = "ami-0e8a34246278c21e4"
}

variable "instance_type" {
  type        = string
  description = "The type of instance to start."
  default     = "t2.micro"
}

variable "ssh_public_key" {
  type        = string
  description = "The public key to use for SSH access."
  default     = ""
}

variable "subnet_id" {
  type        = string
  description = "The ID of the subnet to use."
  default     = ""
}

variable "vpc_id" {
  type        = string
  description = "The ID of the VPC to use. If empty, a new VPC will be created."
  default     = ""
}
