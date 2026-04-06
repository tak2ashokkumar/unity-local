// AiStack interface lives here because constants.ts is the source of truth
// for stack data. The service imports from here — not the other way around.
export interface AiStack {
    id: string;
    title: string;
    description: string;
    version: string;
    category: string;
    icon: string;
}

export const FILTER_CATEGORIES: string[] = [
    'All',
    'Frameworks',
    'IDEs & Notebooks',
    'MLOps & Serving',
    'Libraries',
    'Data & Visualization',
    'LLM & NLP',
    'Computer Vision'
];

const BASE = '/static/assets/images/external-brand/ai-stacks';

export const AI_STACKS: AiStack[] = [

    // ── Frameworks ─────────────────────────────────────────────
    {
        id: 'pytorch',
        title: 'PyTorch',
        description: 'Open-source deep learning framework with dynamic computation graphs.',
        version: 'v2.3.0',
        category: 'Frameworks',
        icon: `${BASE}/pytorch.svg`,
    },
    {
        id: 'tensorflow',
        title: 'TensorFlow',
        description: 'End-to-end ML platform by Google for production workloads.',
        version: 'v2.16.1',
        category: 'Frameworks',
        icon: `${BASE}/tensorflow.svg`,
    },
    {
        id: 'jax',
        title: 'JAX',
        description: 'High-performance numerical computing with auto-differentiation.',
        version: 'v0.4.30',
        category: 'Frameworks',
        icon: `${BASE}/jax.svg`,
    },
    {
        id: 'keras',
        title: 'Keras',
        description: 'High-level neural network API, runs on top of TensorFlow.',
        version: 'v3.4.1',
        category: 'Frameworks',
        icon: `${BASE}/keras.svg`,
    },
    {
        id: 'mxnet',
        title: 'Apache MXNet',
        description: 'Scalable deep learning framework with multi-GPU support.',
        version: 'v1.9.1',
        category: 'Frameworks',
        icon: `${BASE}/Apache_MXNet.svg`,
    },
    {
        id: 'paddlepaddle',
        title: 'PaddlePaddle',
        description: 'Industrial deep learning platform by Baidu.',
        version: 'v2.6.1',
        category: 'Frameworks',
        icon: `${BASE}/paddlepaddle.svg`,
    },

    // ── IDEs & Notebooks ───────────────────────────────────────
    {
        id: 'pycharm',
        title: 'PyCharm Pro',
        description: 'Professional Python IDE with ML & data science tooling.',
        version: 'v2024.1',
        category: 'IDEs & Notebooks',
        icon: `${BASE}/PyCharm_Pro.svg`,
    },
    {
        id: 'jupyterlab',
        title: 'JupyterLab',
        description: 'Interactive notebook environment for data science workflows.',
        version: 'v4.2.0',
        category: 'IDEs & Notebooks',
        icon: `${BASE}/JupyterLab.svg`,
    },
    {
        id: 'vscode',
        title: 'VS Code Server',
        description: 'Remote VS Code with GPU-aware extensions pre-installed.',
        version: 'v1.90.0',
        category: 'IDEs & Notebooks',
        icon: `${BASE}/VS_Code_Server.svg`,
    },
    {
        id: 'zeppelin',
        title: 'Apache Zeppelin',
        description: 'Web-based notebook for data analytics and visualization.',
        version: 'v0.11.1',
        category: 'IDEs & Notebooks',
        icon: `${BASE}/Apache_Zeppelin.svg`,
    },
    {
        id: 'rstudio',
        title: 'RStudio Server',
        description: 'IDE for R with statistical computing & ML packages.',
        version: 'v2024.04',
        category: 'IDEs & Notebooks',
        icon: `${BASE}/RStudio_Server.svg`,
    },
    {
        id: 'comfyui',
        title: 'ComfyUI',
        description: 'Node-based GUI for designing generative AI image workflows.',
        version: 'v0.2.4',
        category: 'IDEs & Notebooks',
        icon: `${BASE}/ComfyUI.svg`,
    },

    // ── MLOps & Serving ────────────────────────────────────────
    {
        id: 'mlflow',
        title: 'MLflow',
        description: 'Platform for ML lifecycle: tracking, packaging, deployment.',
        version: 'v2.14.0',
        category: 'MLOps & Serving',
        icon: `${BASE}/mlflow.svg`,
    },
    {
        id: 'kubeflow',
        title: 'Kubeflow',
        description: 'ML toolkit for Kubernetes with pipeline orchestration.',
        version: 'v1.9.0',
        category: 'MLOps & Serving',
        icon: `${BASE}/kubeflow.svg`,
    },
    {
        id: 'triton',
        title: 'Triton Inference',
        description: 'NVIDIA high-performance inference serving platform.',
        version: 'v24.06',
        category: 'MLOps & Serving',
        icon: `${BASE}/Triton_Inference.svg`,
    },
    {
        id: 'ray',
        title: 'Ray Serve',
        description: 'Scalable model serving with Ray distributed framework.',
        version: 'v2.31.0',
        category: 'MLOps & Serving',
        icon: `${BASE}/Ray_Serve.svg`,
    },
    {
        id: 'bentoml',
        title: 'BentoML',
        description: 'Framework for building production-ready ML services.',
        version: 'v1.2.19',
        category: 'MLOps & Serving',
        icon: `${BASE}/bentoml.svg`,
    },
    {
        id: 'seldon',
        title: 'Seldon Core',
        description: 'Deploy, scale & monitor ML models on Kubernetes.',
        version: 'v1.18.0',
        category: 'MLOps & Serving',
        icon: `${BASE}/Seldon_Core.svg`,
    },

    // ── Libraries ──────────────────────────────────────────────
    {
        id: 'scikit-learn',
        title: 'Scikit-learn',
        description: 'Classical ML algorithms: classification, regression, clustering.',
        version: 'v1.5.0',
        category: 'Libraries',
        icon: `${BASE}/Scikit-learn.svg`,
    },
    {
        id: 'pandas',
        title: 'Pandas & Polars',
        description: 'Fast, flexible data analysis and manipulation tools for Python.',
        version: 'v2.2.0',
        category: 'Libraries',
        icon: `${BASE}/Pandas_and_Polars.svg`,
    },
    {
        id: 'numpy',
        title: 'NumPy & SciPy',
        description: 'Fundamental packages for scientific computing with Python.',
        version: 'v1.26.0',
        category: 'Libraries',
        icon: `${BASE}/NumPy_and_SciPy.svg`,
    },
    {
        id: 'xgboost',
        title: 'XGBoost',
        description: 'Optimized distributed gradient boosting library for speed and performance.',
        version: 'v2.0.3',
        category: 'Libraries',
        icon: `${BASE}/XGBoost.svg`,
    },
    {
        id: 'lightgbm',
        title: 'LightGBM',
        description: 'Fast, distributed, high-performance gradient boosting framework by Microsoft.',
        version: 'v4.3.0',
        category: 'Libraries',
        icon: `${BASE}/LightGBM.svg`,
    },
    {
        id: 'catboost',
        title: 'CatBoost',
        description: 'Gradient boosting on decision trees by Yandex with categorical feature support.',
        version: 'v1.2.5',
        category: 'Libraries',
        icon: `${BASE}/CatBoost.svg`,
    },
    {
        id: 'dask',
        title: 'Dask',
        description: 'Parallel computing library that scales Python analytics across clusters.',
        version: 'v2024.5.0',
        category: 'Libraries',
        icon: `${BASE}/Dask.svg`,
    },
    {
        id: 'rapids',
        title: 'NVIDIA RAPIDS',
        description: 'GPU-accelerated data science and ML pipelines on NVIDIA hardware.',
        version: 'v24.06',
        category: 'Libraries',
        icon: `${BASE}/NVIDIA_RAPIDS.svg`,
    },

    // ── Data & Visualization ───────────────────────────────────
    {
        id: 'apache-spark',
        title: 'Apache Spark ML',
        description: 'Multi-language engine for data engineering, data science, and ML at scale.',
        version: 'v3.5.0',
        category: 'Data & Visualization',
        icon: `${BASE}/Apache_Spark_ML.svg`,
    },
    {
        id: 'apache-superset',
        title: 'Apache Superset',
        description: 'Modern data exploration and visualization platform.',
        version: 'v3.0.1',
        category: 'Data & Visualization',
        icon: `${BASE}/superset.svg`,
    },
    {
        id: 'tensorboard',
        title: 'TensorBoard',
        description: 'Provides the visualization and tooling needed for ML experimentation.',
        version: 'v2.16.0',
        category: 'Data & Visualization',
        icon: `${BASE}/tensorboard.svg`,
    },

    // ── LLM & NLP ──────────────────────────────────────────────
    {
        id: 'huggingface-tgi',
        title: 'Hugging Face TGI',
        description: 'Toolkit for deploying and serving Large Language Models.',
        version: 'v2.0.1',
        category: 'LLM & NLP',
        icon: `${BASE}/Hugging_Face.svg`,
    },
    {
        id: 'vllm',
        title: 'vLLM',
        description: 'High-throughput and memory-efficient LLM serving engine.',
        version: 'v0.4.3',
        category: 'LLM & NLP',
        icon: `${BASE}/vllm.svg`,
    },
    {
        id: 'ollama',
        title: 'Ollama',
        description: 'Get up and running with large language models locally.',
        version: 'v0.1.41',
        category: 'LLM & NLP',
        icon: `${BASE}/ollama.svg`,
    },
    {
        id: 'langchain',
        title: 'LangChain',
        description: 'Framework for building context-aware LLM-powered applications and agents.',
        version: 'v0.2.6',
        category: 'LLM & NLP',
        icon: `${BASE}/LangChain.svg`,
    },
    {
        id: 'llama-cpp',
        title: 'llama.cpp',
        description: 'Efficient LLM inference in C/C++ with GGUF quantization support.',
        version: 'b3300',
        category: 'LLM & NLP',
        icon: `${BASE}/llama.cpp.svg`,
    },
    {
        id: 'spacy',
        title: 'spaCy',
        description: 'Industrial-strength NLP library for tokenization, NER, and text classification.',
        version: 'v3.7.4',
        category: 'LLM & NLP',
        icon: `${BASE}/spaCy.svg`,
    },

    // ── Computer Vision ────────────────────────────────────────
    {
        id: 'opencv',
        title: 'OpenCV & CUDA',
        description: 'Open source computer vision library with GPU-accelerated CUDA support.',
        version: 'v4.9.0',
        category: 'Computer Vision',
        icon: `${BASE}/OpenCV_and_CUDA.svg`,
    },
    {
        id: 'ultralytics-yolo',
        title: 'Ultralytics YOLO',
        description: 'State-of-the-art real-time object detection system.',
        version: 'v8.2.0',
        category: 'Computer Vision',
        icon: `${BASE}/Ultralytics_YOLO.svg`,
    },
    {
        id: 'detectron2',
        title: 'Detectron2',
        description: 'Meta\'s next-generation system for object detection and segmentation.',
        version: 'v0.6',
        category: 'Computer Vision',
        icon: `${BASE}/Detectron2.svg`,
    },
    {
        id: 'stable-diffusion',
        title: 'Stable Diffusion',
        description: 'Open-source latent diffusion model for high-quality image generation.',
        version: 'v3.0',
        category: 'Computer Vision',
        icon: `${BASE}/Stable_Diffusion.svg`,
    },
];
