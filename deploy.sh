echo "Building frontend..."
cd frontend
npm run build
cd ..
echo "Deploying frontend to S3..."
aws s3 sync frontend/dist s3://uccnowstack-uccnowwebsites3bucket33df281f-j3cquancavxe --delete --profile ho7
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id ES0UITRLTTZK1 --paths "/*" --profile ho7