script_dir=$(dirname $0)

# Creates project in local machine
echo "Creating project in local machine with docker compose..."
echo "--------------------------------------------"
docker compose up -d
echo "--------------------------------------------"
echo "Project created in local machine!"
echo "--------------------------------------------"


# Executes migration from Postgres to Mongo
echo "Starting migration from Postgres to Mongo..."
echo "--------------------------------------------"
$script_dir/pgToMongo.sh .env
echo "Migration from Postgres to Mongo finished!"