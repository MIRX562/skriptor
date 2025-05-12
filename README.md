# run minio docker (optional)

```cli
docker run -p 9000:9000 -p 9001:9001 --name minio-local -v D:\minio\data:/data -e "MINIO_ROOT_USER=MIRX" -e "MINIO_ROOT_PASSWORD=ASEMJOWO@562" quay.io/minio/minio server /data --console-address ":9001"
```
