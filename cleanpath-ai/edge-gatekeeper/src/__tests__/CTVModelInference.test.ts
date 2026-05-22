import { CTVModelInference } from '../ml/CTVModelInference';
import { Logger } from '@cleanpath/logging';
import { CTVFeatureVector, CTV_FEATURE_NAMES } from '@cleanpath/types';
import * as fs from 'fs';

// Mock onnxruntime-node
const mockRun = jest.fn();

// Mock session object
const mockSession = {
    run: mockRun
};

// Mock onnxruntime-node module
jest.mock('onnxruntime-node', () => {
    return {
        InferenceSession: {
            create: jest.fn().mockImplementation(() => Promise.resolve(mockSession))
        },
        Tensor: jest.fn().mockImplementation((type, data, dims) => ({ type, data, dims }))
    };
}, { virtual: true });

// Mock fs
jest.mock('fs');

describe('CTVModelInference', () => {
    let inference: CTVModelInference;
    let mockLogger: Logger;

    const mockFeatures: CTVFeatureVector = {} as any;
    // Fill with zeroes
    CTV_FEATURE_NAMES.forEach(f => (mockFeatures as any)[f] = 0);

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        } as any;

        (fs.existsSync as jest.Mock).mockReturnValue(true);
    });

    it('should load model on initialization if file exists', async () => {
        inference = new CTVModelInference('/path/to/model.onnx', mockLogger);

        // Private loading promise should be awaited ideally, but we can check if create was called
        // Since it's async in constructor, we might need to wait a tick
        await new Promise(r => setTimeout(r, 10)); // flush promises

        expect(require('onnxruntime-node').InferenceSession.create).toHaveBeenCalledWith('/path/to/model.onnx');
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('loaded successfully'));
    });

    it('should log warning validation if model file missing', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        inference = new CTVModelInference('/path/to/model.onnx', mockLogger);

        expect(require('onnxruntime-node').InferenceSession.create).not.toHaveBeenCalled();
        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });

    it('should run prediction and return probability', async () => {
        inference = new CTVModelInference('/path/to/model.onnx', mockLogger);
        await new Promise(r => setTimeout(r, 10));

        // Mock run output with probability 0.85 for class 1
        // XGBoost onnx output usually has 'probabilities' as a sequence of maps (if zipmap=True)
        // OR a tensor (if zipmap=False).
        // Our code handles 'output_probability' or 'probabilities'.
        // Let's assume tensor format [prob_0, prob_1]

        mockRun.mockResolvedValue({
            'output_probability': {
                data: [0.15, 0.85] // Float32Array-like
            }
        });

        const score = await inference.predict(mockFeatures);

        expect(score).toBe(0.85);
        expect(mockRun).toHaveBeenCalled();

        // Verify input tensor construction
        const Tensor = require('onnxruntime-node').Tensor;
        expect(Tensor).toHaveBeenCalledWith('float32', expect.any(Float32Array), [1, CTV_FEATURE_NAMES.length]);
    });

    it('should return -1 on inference error', async () => {
        inference = new CTVModelInference('/path/to/model.onnx', mockLogger);
        await new Promise(r => setTimeout(r, 10));

        mockRun.mockRejectedValue(new Error('Inference failed'));

        const score = await inference.predict(mockFeatures);
        expect(score).toBe(-1);
        expect(mockLogger.error).toHaveBeenCalled();
    });
});
