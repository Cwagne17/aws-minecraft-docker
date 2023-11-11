output "ec2_instance_id" {
  value = module.minecraft-server.id
}

output "ip_address" {
  value = module.minecraft-server.public_ip
}

output "ssh_command" {
  value = "ssh -i <KEY_PATH> ec2-user@${module.minecraft-server.public_ip}"
}

output "s3_bucket" {
  value = module.s3-bucket.s3_bucket_id
}

output "s3_bucket_arn" {
  value = module.s3-bucket.s3_bucket_arn
}
