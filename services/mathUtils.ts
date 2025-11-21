import { DataPoint, Coefficients } from '../types';

// Calculate Quadratic Regression (Least Squares Method for Polynomial degree 2)
// y = ax^2 + bx + c
export const calculateQuadraticRegression = (data: DataPoint[]): Coefficients => {
  const n = data.length;
  if (n < 3) {
    return { a: 0, b: 0, c: 0 };
  }

  let sx = 0, sx2 = 0, sx3 = 0, sx4 = 0;
  let sy = 0, sxy = 0, sx2y = 0;

  for (const p of data) {
    const x2 = p.x * p.x;
    sx += p.x;
    sx2 += x2;
    sx3 += x2 * p.x;
    sx4 += x2 * p.x * p.x;
    sy += p.y;
    sxy += p.x * p.y;
    sx2y += x2 * p.y;
  }

  // Matrix format:
  // [ sx4  sx3  sx2 ] [ a ]   [ sx2y ]
  // [ sx3  sx2  sx  ] [ b ] = [ sxy  ]
  // [ sx2  sx   n   ] [ c ]   [ sy   ]
  
  // Using Cramer's Rule or Gaussian elimination. Here is a manual solver for 3x3.
  const m = [
    [sx4, sx3, sx2],
    [sx3, sx2, sx],
    [sx2, sx, n]
  ];
  const r = [sx2y, sxy, sy];

  // Determinant of 3x3 matrix
  const det = (m: number[][]) => {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
           m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
           m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  };

  const D = det(m);
  if (Math.abs(D) < 1e-9) return { a: 0, b: 0, c: 0 };

  // Helper to replace a column
  const replaceCol = (matrix: number[][], col: number[], colIndex: number) => {
    return matrix.map((row, i) => row.map((val, j) => j === colIndex ? col[i] : val));
  };

  const Da = det(replaceCol(m, r, 0));
  const Db = det(replaceCol(m, r, 1));
  const Dc = det(replaceCol(m, r, 2));

  return {
    a: Da / D,
    b: Db / D,
    c: Dc / D
  };
};

// Generates a fixed set of 10 points for consistent demonstration
export const generateFixedData = (): DataPoint[] => {
  // Hardcoded points that roughly follow a quadratic curve y = ax^2 + bx + c
  // This ensures the "Reset" button always restores the exact same 10 points.
  const rawPoints = [
    { x: 4, y: 158 },
    { x: 9, y: 142 },
    { x: 14, y: 128 },
    { x: 20, y: 118 },
    { x: 26, y: 112 }, // Near local minimum
    { x: 32, y: 109 }, // Near local minimum
    { x: 37, y: 115 },
    { x: 43, y: 126 },
    { x: 48, y: 142 },
    { x: 53, y: 165 },
  ];

  return rawPoints.map(p => ({
    id: `fixed-${p.x}`,
    x: p.x,
    y: p.y,
  }));
};

export const evaluateQuadratic = (coeffs: Coefficients, x: number): number => {
  return coeffs.a * x * x + coeffs.b * x + coeffs.c;
};