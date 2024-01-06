#!/bin/bash

echo "AWS Batch Job Array Index: $AWS_BATCH_JOB_ARRAY_INDEX"
echo "AWS Batch Job ID: $AWS_BATCH_JOB_ID"

echo "Verifying EFS mount..."

echo "Content of /mnt:"
ls -l /mnt

echo "Tree of /mnt:"
tree /mnt

# Verify EFS mount
echo "Content of /mnt/efs:"
ls -l /mnt/efs

echo "Tree of /mnt/efs:"
tree /mnt/efs

echo "Content of /mnt/efs/lambda:"
ls -l /mnt/efs/lambda

echo "Tree of /mnt/efs/lambda:"
tree /mnt/efs/lambda
