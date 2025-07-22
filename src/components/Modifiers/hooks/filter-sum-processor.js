class FilterSumProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }
  process(inputs, outputs) {
    // Sum all input channels (assume mono for filter freq)
    const input0 = inputs[0][0] || [];
    const input1 = inputs[1][0] || [];
    const input2 = inputs[2][0] || [];
    const output = outputs[0][0];
    for (let i = 0; i < output.length; i++) {
      output[i] = (input0[i] || 0) + (input1[i] || 0) + (input2[i] || 0);
    }
    return true;
  }
}
registerProcessor("filter-sum-processor", FilterSumProcessor);
