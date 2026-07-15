aws s3 sync frontend/ s3://xx --delete --profile ho7
aws cloudfront create-invalidation --distribution-id xx --paths "/*" --profile ho7