output "ec2_instance_id" {
  value = module.minecraft-server.instance_id
}

output "ip_address" {
  value = module.minecraft-server.public_ip
}

output "ssh_command" {
  value = "ssh -i ${aws_key_pair.ssh.private_key} ec2-user@${module.minecraft-server.public_ip}"
}

output "s3_bucket" {
  value = aws_s3_bucket.minecraft-server.bucket
}

output "s3_bucket_arn" {
  value = aws_s3_bucket.minecraft-server.arn
}
