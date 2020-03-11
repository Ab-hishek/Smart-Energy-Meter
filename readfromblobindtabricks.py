df=spark.read.format('avro').options(header='true',inferSchema='true').load("wasbs://smartenergycapturedata@smartenergyconsumption.blob.core.windows.net/energyeventhub/smartmeterenergyhub/0/2019/11/08/15/45/08.avro")

df = df.withColumn("Body", df["body"].cast("string"))
display(df)
