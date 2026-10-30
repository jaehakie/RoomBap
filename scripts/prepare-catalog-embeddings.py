"""Rebuild catalog search vectors with the existing multilingual MiniLM model."""
from pathlib import Path
import argparse, hashlib, json, math, os
from fastembed import TextEmbedding

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--cache-dir',type=Path,default=Path(os.getenv('EMBEDDING_CACHE_DIR',root/'.cache/embeddings')))
parser.add_argument('--download',action='store_true',help='Explicitly allow model download for first-time setup')
args=parser.parse_args()
source=json.loads((root/'server/data/catalog-embedding-inputs.json').read_text(encoding='utf-8'))
texts=source['texts']
model_id='sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
model=TextEmbedding(model_name=model_id,cache_dir=str(args.cache_dir),threads=2,providers=['CPUExecutionProvider'],local_files_only=not args.download)
vectors={}
for key,vector in zip(texts,model.embed(list(texts.values()))):
    values=[round(float(x),7) for x in vector]
    assert len(values)==384 and all(math.isfinite(x) for x in values) and sum(x*x for x in values)>0
    vectors[key]=values
assert len(vectors)==len(texts)
result={'model':model_id,'dimension':384,'method':'precomputed_catalog_and_feature_vectors','catalog_version':source['catalog_version'],'text_hashes':{key:hashlib.sha256(text.encode()).hexdigest() for key,text in texts.items()},'vectors':vectors}
target=root/'server/data/vectors.json'
temporary=target.with_suffix('.json.tmp')
temporary.write_text(json.dumps(result,separators=(',',':')),encoding='utf-8')
temporary.replace(target)
print(json.dumps({'catalog_version':source['catalog_version'],'vectors':len(vectors),'dimension':384}))
