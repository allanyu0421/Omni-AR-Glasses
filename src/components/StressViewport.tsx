import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

interface StressViewportProps {
  mass: number;
  acceleration: number;
  compressionLoad: number;
  bendingSF: number;
}

const StressViewport: React.FC<StressViewportProps> = ({
  mass,
  acceleration,
  compressionLoad,
  bendingSF,
}) => {
  const data = useMemo(() => {
    const traces: any[] = [];

    // --- Headset Geometry (Approximated) ---
    
    // Front Visor (Outer Arc - Brow Bar)
    const visorRes = 40;
    const visorX: number[] = [];
    const visorY: number[] = [];
    const visorZ: number[] = [];
    for (let i = 0; i <= visorRes; i++) {
      const theta = (i / visorRes) * Math.PI - Math.PI / 2;
      const r = 11;
      visorX.push(r * Math.sin(theta));
      visorY.push(r * Math.cos(theta));
      // Parabolic curvature for the visor
      visorZ.push(2 * Math.cos(theta * 1.2)); 
    }

    traces.push({
      type: 'scatter3d',
      mode: 'lines',
      x: visorX, y: visorY, z: visorZ,
      line: { color: '#0ea5e9', width: 8 },
      name: 'Primary Brow Bar',
      hoverinfo: 'none'
    });

    // Visor Bottom Edge
    const bVisorX = visorX.map(x => x * 0.9);
    const bVisorY = visorY.map(y => y * 0.9);
    const bVisorZ = visorZ.map(z => z - 5);
    traces.push({
      type: 'scatter3d',
      mode: 'lines',
      x: bVisorX, y: bVisorY, z: bVisorZ,
      line: { color: '#0ea5e9', width: 4, dash: 'dot' },
      name: 'Lower Optic Seal',
      hoverinfo: 'none'
    });

    // Connect Top and Bottom for "Surface" feel
    for (let i = 0; i <= visorRes; i += 8) {
      traces.push({
        type: 'scatter3d',
        mode: 'lines',
        x: [visorX[i], bVisorX[i]],
        y: [visorY[i], bVisorY[i]],
        z: [visorZ[i], bVisorZ[i]],
        line: { color: 'rgba(14, 165, 233, 0.3)', width: 2 },
        showlegend: false,
        hoverinfo: 'none'
      });
    }

    // Temples (Side Arms)
    const templeLen = 18;
    // Left Temple
    traces.push({
      type: 'scatter3d',
      mode: 'lines',
      x: [-11, -11, -10],
      y: [0, -templeLen, -templeLen],
      z: [2, 1, -1],
      line: { color: '#0ea5e9', width: 8 },
      name: 'Left Temple Node',
      hoverinfo: 'none'
    });
    // Right Temple
    traces.push({
      type: 'scatter3d',
      mode: 'lines',
      x: [11, 11, 10],
      y: [0, -templeLen, -templeLen],
      z: [2, 1, -1],
      line: { color: '#0ea5e9', width: 8 },
      name: 'Right Temple Node',
      hoverinfo: 'none'
    });

    // --- Dynamic Force Vectors (Cones) ---

    const getHexColor = (scale: number, t1: number, t2: number) => {
      if (scale > t2) return '#f43f5e'; // Rose-500
      if (scale > t1) return '#fbbf24'; // Amber-400
      return '#10b981'; // Emerald-500
    };

    // Impact / Kinetic Energy (Frontal Center)
    const impactScale = (mass * acceleration) / 0.5;
    const impactColor = getHexColor(impactScale, 2.5, 3.5);
    
    traces.push({
      type: 'cone',
      x: [0], y: [13 + impactScale * 2], z: [1],
      u: [0], v: [-impactScale * 6], w: [0],
      sizemode: 'absolute',
      sizeref: 2,
      colorscale: [[0, impactColor], [1, impactColor]],
      showscale: false,
      name: 'Impact Load Vector',
      hoverinfo: 'name+u'
    });

    // Compression Load (Lateral Temples)
    const compScale = compressionLoad / 40;
    const compColor = getHexColor(compScale, 2.5, 4);
    
    traces.push({
      type: 'cone',
      x: [-14 - compScale], y: [-8], z: [0],
      u: [compScale * 4], v: [0], w: [0],
      sizemode: 'absolute',
      sizeref: 1.5,
      colorscale: [[0, compColor], [1, compColor]],
      showscale: false,
      name: 'Lateral Compression',
      hoverinfo: 'name'
    });
    
    traces.push({
      type: 'cone',
      x: [14 + compScale], y: [-8], z: [0],
      u: [-compScale * 4], v: [0], w: [0],
      sizemode: 'absolute',
      sizeref: 1.5,
      colorscale: [[0, compColor], [1, compColor]],
      showscale: false,
      name: 'Lateral Compression',
      hoverinfo: 'name'
    });

    // Bending Stress (Temples)
    const bendVal = bendingSF * mass * 5;
    const bendColor = getHexColor(bendVal, 2, 3);

    traces.push({
      type: 'cone',
      x: [-11], y: [-13], z: [1 + bendVal],
      u: [0], v: [0], w: [-bendVal * 2.5],
      sizemode: 'absolute',
      sizeref: 1.8,
      colorscale: [[0, bendColor], [1, bendColor]],
      showscale: false,
      name: 'Flexural Momentum',
      hoverinfo: 'name'
    });

    traces.push({
      type: 'cone',
      x: [11], y: [-13], z: [1 + bendVal],
      u: [0], v: [0], w: [-bendVal * 2.5],
      sizemode: 'absolute',
      sizeref: 1.8,
      colorscale: [[0, bendColor], [1, bendColor]],
      showscale: false,
      name: 'Flexural Momentum',
      hoverinfo: 'name'
    });

    // Dial Shearing placeholder (Right temple)
    const shearScale = (mass * acceleration * 2) / 0.5;
    const shearColor = getHexColor(shearScale, 3, 5);
    traces.push({
      type: 'cone',
      x: [12], y: [-2], z: [3],
      u: [0], v: [0], w: [-shearScale],
      sizemode: 'absolute',
      sizeref: 1.2,
      colorscale: [[0, shearColor], [1, shearColor]],
      showscale: false,
      name: 'Dial Pivot Shear',
      hoverinfo: 'name'
    });

    return traces;
  }, [mass, acceleration, compressionLoad, bendingSF]);

  return (
    <div className="w-full h-full min-h-[400px] bg-[#020617] rounded-2xl overflow-hidden shadow-inner border border-white/5">
      <Plot
        data={data}
        layout={{
          autosize: true,
          showlegend: false,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          margin: { l: 0, r: 0, b: 0, t: 0 },
          scene: {
            xaxis: { visible: false, range: [-20, 20] },
            yaxis: { visible: false, range: [-20, 20] },
            zaxis: { visible: false, range: [-20, 20] },
            camera: {
              eye: { x: 1.5, y: 1.5, z: 1.2 },
              up: { x: 0, y: 0, z: 1 }
            },
            aspectmode: 'cube'
          }
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false }}
      />
    </div>
  );
};

export default StressViewport;
