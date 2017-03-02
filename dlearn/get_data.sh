# downloads Kaggle data from gcloud bucket onto VM
# requires you to be logged into and running this from the VM

# gets the top 1000 files in the bucket
# gsutil -m cp `gsutil ls gs://medical_image_ml_bucket/kaggle_train/ | head -n 1000` training_data/

# gets random 1000 files from the bucket
echo "getting 1000 files for training.."
gsutil -m cp `gsutil ls gs://medical_image_ml_bucket/kaggle_train/ | shuf -n 1000` training_data/