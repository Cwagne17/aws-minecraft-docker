terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

module "mc-server" {
  source = "./.."

  project_name = "test-minecraft-server"
  #   instance_type = "t3.large"
}
