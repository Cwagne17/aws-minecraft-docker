output "ec2_instance_id" {
  value = module.mc-server.ec2_instance_id
}

output "ip_address" {
  value = module.mc-server.ip_address
}

output "ssh_command" {
  value = module.mc-server.ssh_command
}

output "s3_bucket" {
  value = module.mc-server.s3_bucket
}

output "s3_bucket_arn" {
  value = module.mc-server.s3_bucket_arn
}
