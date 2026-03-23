import { Injectable } from '@angular/core';
import { Options } from 'vis-network/standalone';

@Injectable()
export class UnityTopologyoptionsService {

  constructor() { }

  getOptions(nodesCount?: number) {
    switch (true) {
      case nodesCount <= 100: return this.getInitialOptions();
      case nodesCount <= 500: return this.getMediumViewOptions();
      case nodesCount > 500: return this.getLargeViewOptions();
      default: return this.getInitialOptions();
    }
  }

  getInitialOptions() {
    let options: Options = {
      width: '100%',
      height: '100%',
      nodes: {
        shapeProperties: {
          useBorderWithImage: false,
          interpolation: true,
        },
      },
      edges: {
        width: 0.5,
      },
      interaction: {
        dragNodes: true,
        hover: true,
        hoverConnectedEdges: false,
        navigationButtons: true,
        zoomView: true
      },
      physics: {
        barnesHut: {
          theta: 0.1,
          gravitationalConstant: -10000,
          avoidOverlap: 0.5,
          springConstant: 0.04,
        },
        stabilization: {
          fit: true
        },
      },
      layout: {
        randomSeed: 20,
        improvedLayout: true
      }
    }
    return options;
  }

  getMediumViewOptions() {
    let options: Options = {
      width: '100%',
      height: '100%',
      nodes: {
        shapeProperties: {
          useBorderWithImage: false,
          interpolation: true,
        },
      },
      edges: {
        width: 0.5,
      },
      interaction: {
        dragNodes: true,
        hover: true,
        hoverConnectedEdges: false,
        navigationButtons: true,
        zoomView: true
      },
      physics: {
        barnesHut: {
          theta: 0.5,
          gravitationalConstant: -2000,
          avoidOverlap: 0.2,
          springConstant: 0.01,
        },
        stabilization: {
          fit: true
        },
        timestep: 0.3
      },
      layout: {
        randomSeed: 20,
        improvedLayout: true
      }
    }
    return options;
  }

  getLargeViewOptions() {
    let options: Options = {
      width: '100%',
      height: '100%',
      nodes: {
        shapeProperties: {
          useBorderWithImage: false,
          interpolation: true,
        },
      },
      edges: {
        width: 0.5,
      },
      interaction: {
        dragNodes: true,
        hover: true,
        hoverConnectedEdges: false,
        navigationButtons: true,
        zoomView: true
      },
      physics: {
        barnesHut: {
          theta: 0.5,
          gravitationalConstant: -2000,
          avoidOverlap: 0.2,
          springConstant: 0.01,
        },
        stabilization: {
          fit: true
        },
      }
    }
    return options;
  }

  getLayoutSubOptions(nodesCount?: number) {
    switch (true) {
      case nodesCount <= 100: return this.getInitialLayoutSubOptions();
      case nodesCount <= 500: return this.getMediumViewOptions();
      case nodesCount > 500: return this.getLargeViewOptions();
      default: return this.getInitialOptions();
    }
  }

  getInitialLayoutSubOptions() {
    return {
      layout: {
        randomSeed: 20,
        improvedLayout: true
      },
      physics: {
        barnesHut: {
          theta: 0.1,
          gravitationalConstant: -10000,
          avoidOverlap: 0.5,
          springConstant: 0.04,
          centralGravity: 0.1,
        },
        stabilization: {
          fit: true
        },
      }
    }
  }

  getMediumLayoutSubOptions() {
    return {
      layout: {
        randomSeed: 2,
        improvedLayout: false
      },
      physics: {
        barnesHut: {
          theta: 0.5,
          gravitationalConstant: -10000,
          avoidOverlap: 0.3,
          springConstant: 0.01,
        },
        stabilization: {
          fit: true
        },
        timestep: 0.3
      }
    }
  }

  getLargeLayoutSubOptions() {
    return {
      layout: {
        randomSeed: 2,
        improvedLayout: false
      },
      physics: {
        barnesHut: {
          theta: 0.5,
          gravitationalConstant: -10000,
          avoidOverlap: 0.3,
          springConstant: 0.01,
        },
        stabilization: {
          fit: true
        },
        timestep: 0.3
      }
    }
  }
}
