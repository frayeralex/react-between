import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

const external = [/^react($|\/)/, /^react-dom($|\/)/];

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.cjs',
                format: 'cjs',
                sourcemap: true,
                exports: 'named',
            },
            {
                file: 'dist/index.mjs',
                format: 'es',
                sourcemap: true,
            },
        ],
        external,
        plugins: [
            resolve(),
            typescript({
                tsconfig: './tsconfig.build.json',
                declaration: false,
                declarationDir: undefined,
                outDir: 'dist',
            }),
        ],
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'es',
        },
        external,
        plugins: [dts()],
    },
];
