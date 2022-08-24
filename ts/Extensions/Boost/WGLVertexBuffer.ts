/* *
 *
 *  Copyright (c) 2019-2021 Highsoft AS
 *
 *  Boost module: stripped-down renderer for higher performance
 *
 *  License: highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type { WGLDrawModeValue } from './WGLDrawMode';
import type WGLShader from './WGLShader';

/* *
 *
 *  Class
 *
 * */

/**
 * Vertex Buffer abstraction.
 * A vertex buffer is a set of vertices which are passed to the GPU
 * in a single call.
 *
 * @private
 * @class
 * @name WGLVertexBuffer
 *
 * @param {WebGLContext} gl
 * Context in which to create the buffer.
 * @param {WGLShader} shader
 * Shader to use.
 */
class WGLVertexBuffer {

    /* *
     *
     *  Constructor
     *
     * */

    public constructor(
        gl: WebGLRenderingContext,
        shader: WGLShader,
        public dataComponents: number,
        data: Float32Array | number[]
        /* , type */
    ) {
        this.components = dataComponents || 2;
        this.dataComponents = dataComponents;
        this.gl = gl;
        this.shader = shader;

        // Should ideally support other typed arrays too
        this.typedArray = (data instanceof Float32Array) ?
            data : new Float32Array(data);
    }

    /* *
     *
     *  Properties
     *
     * */

    private buffer: (false|WebGLBuffer|null) = false;

    public typedArray: Float32Array;

    private components: number;

    private gl: WebGLRenderingContext;

    private shader: WGLShader;

    /* *
     *
     *  Functions
     *
     * */

    /**
    */
    public bind(
        attributeName: string
    ) : boolean {
        const gl = this.gl;
        const shaderProgram = this.shader.getProgram();
        if (!this.buffer || !shaderProgram) {
            return false;
        }

        const attributeNo = gl.getAttribLocation(shaderProgram, attributeName);
        if (attributeNo < 0) {
            return false;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(attributeNo);
        this.gl.vertexAttribPointer(
            attributeNo,
            this.components,
            this.gl.FLOAT,
            false,
            0,
            0
        );

        return true;
    }

    /**
     * Build the buffer
     * @param {Array<number>} data
     * Zero padded array of indices
     * @param {number} dataComponents
     * Mumber of components per. indice
     */
    public build(
    ): boolean {
        const gl = this.gl;

        if (this.typedArray.length === 0) {
            // console.error('trying to render empty vbuffer');
            this.destroy();
            return false;
        }

        if (this.buffer) {
            gl.deleteBuffer(this.buffer);
        }

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.typedArray, gl.STATIC_DRAW);

        return true;
    }

    /**
     * @private
     */
    public destroy(): void {
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
            this.buffer = null;
        }

        this.components = this.dataComponents || 2;
    }

    /**
     * Render the buffer
     *
     * @private
     * @param {number} from
     * Start indice.
     * @param {number} to
     * End indice.
     * @param {WGLDrawModeValue} drawMode
     * Draw mode.
     */
    public render(
        from: number,
        to: number,
        drawMode: WGLDrawModeValue
    ): boolean {
        if (!this.typedArray) {
            return false;
        }

        const length = this.typedArray.length;
        if (!length) {
            return false;
        }

        if (!from || from > length || from < 0) {
            from = 0;
        }

        if (!to || to > length) {
            to = length;
        }

        if (from >= to) {
            return false;
        }

        drawMode = drawMode || 'POINTS';

        this.gl.drawArrays(
            this.gl[drawMode],
            from / this.components,
            (to - from) / this.components
        );

        return true;
    }

}

/* *
 *
 *  Default Export
 *
 * */

export default WGLVertexBuffer;
