# -------------------------------------------
# SET TERRAFORM REQUIREMENTS TO RUN MODULE
# -------------------------------------------

terraform {
  required_version = ">= 1.5.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# -------------------------------------------
# CREATE VPC
# -------------------------------------------

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  create_vpc = var.create_vpc

  name = var.project_name

  azs            = ["us-east-1a"]
  cidr           = "10.0.0.0/18"
  public_subnets = ["10.0.1.0/24"]
}


# -------------------------------------------
# CREATE S3 BUCKET FOR BACKUPS
# -------------------------------------------

module "s3-bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.15.1"

  bucket = "${var.project_name}-backups"

  # Enables lifecycle rule for cost-effective storage
  lifecycle_rule = [
    {
      id      = "infrequent-access-transition"
      enabled = true

      transition = {
        days          = 30
        storage_class = "STANDARD_IA"
      }
    }
  ]
}


# -------------------------------------------
# CREATE EC2 INSTANCE
# -------------------------------------------

# latest Amazon Linux 2 AMI
data "aws_ami" "al2023" {
  most_recent = true

  filter {
    name   = "name"
    values = ["al2023-ami-2023*x86_64"]
  }

  filter {
    name   = "owner-alias"
    values = ["amazon"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}


# create SSH key pair
resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "ssh" {
  key_name   = var.project_name
  public_key = tls_private_key.ssh.public_key_openssh
}


# create EC2 instance
module "minecraft-server" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "5.5.0"

  name = var.project_name

  ami           = data.aws_ami.al2023.id
  instance_type = var.instance_type

  key_name = aws_key_pair.ssh.key_name

  associate_public_ip_address = true
  subnet_id                   = module.vpc.public_subnets[0]
  vpc_security_group_ids      = [module.security-group.security_group_id]

  create_iam_instance_profile = true
  iam_role_name               = var.project_name
  iam_role_policies = {
    "S3FullAccess" = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
  }
}


# -------------------------------------------
# CREATE SECURITY GROUP
# -------------------------------------------

module "security-group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.1.0"

  name   = var.project_name
  vpc_id = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      description = "SSH access"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      from_port   = 25565
      to_port     = 25565
      protocol    = "tcp"
      description = "Minecraft server"
      cidr_blocks = ["0.0.0.0/0"]
    },
  ]
}
