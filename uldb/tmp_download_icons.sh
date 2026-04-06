#!/bin/bash
DIR="C:/Users/AshokKumar/Desktop/unity-local/uldb/static/assets/images/external-brand/ai-stacks"
mkdir -p "$DIR"
cd "$DIR"

echo "Downloading AI icons..."

curl -sL -o pytorch.svg https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg
curl -sL -o tensorflow.svg https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg
curl -sL -o keras.svg https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/keras/keras-original.svg
curl -sL -o pycharm.svg https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pycharm/pycharm-original.svg
curl -sL -o jupyter.svg https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jupyter/jupyter-original-wordmark.svg
curl -sL -o vscode.svg https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg
curl -sL -o zeppelin.svg https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apache/apache-original.svg
curl -sL -o rstudio.svg https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rstudio/rstudio-original.svg
curl -sL -o scikitlearn.svg https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg
curl -sL -o mxnet.svg https://raw.githubusercontent.com/apache/mxnet/master/docs/static_site/src/assets/img/mxnet-logo.svg

# For those without devicon SVG, use fallback SVGs we can create easily
cat << 'EOF' > jax.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#4B8BBE"/><text x="50" y="60" font-family="Arial" font-size="30" font-weight="bold" fill="white" text-anchor="middle">JAX</text></svg>
EOF

cat << 'EOF' > paddlepaddle.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#0073eb"/><text x="50" y="60" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle">Paddle</text></svg>
EOF

cat << 'EOF' > mlflow.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="15" fill="#0194E2"/><text x="50" y="55" font-family="Arial" font-size="25" font-weight="bold" fill="white" text-anchor="middle">MLflow</text></svg>
EOF

cat << 'EOF' > kubeflow.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="15" fill="#005AD2"/><text x="50" y="55" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle">Kubeflow</text></svg>
EOF

cat << 'EOF' > triton.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="15" fill="#76B900"/><text x="50" y="55" font-family="Arial" font-size="25" font-weight="bold" fill="white" text-anchor="middle">Triton</text></svg>
EOF

cat << 'EOF' > ray.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#028CF0"/><text x="50" y="60" font-family="Arial" font-size="30" font-weight="bold" fill="white" text-anchor="middle">Ray</text></svg>
EOF

cat << 'EOF' > bentoml.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="15" fill="#00D2B4"/><text x="50" y="55" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle">BentoML</text></svg>
EOF

cat << 'EOF' > seldon.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#3B185D"/><text x="50" y="60" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle">Seldon</text></svg>
EOF

cat << 'EOF' > huggingface.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#FFD21E"/><text x="50" y="60" font-family="Arial" font-size="30" font-weight="bold" fill="black" text-anchor="middle">HF</text></svg>
EOF

cat << 'EOF' > vllm.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="15" fill="#333333"/><text x="50" y="55" font-family="Arial" font-size="30" font-weight="bold" fill="white" text-anchor="middle">vLLM</text></svg>
EOF

cat << 'EOF' > ollama.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#111111"/><text x="50" y="60" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle">Ollama</text></svg>
EOF

echo "Done"
