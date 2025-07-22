import Knob from "../Knob";
import Row from "../Row";
import Title from "../Title";
import { useSynthStore } from "@/store/synthStore";

function Filter() {
  const {
    filterCutoff,
    filterEmphasis,
    filterContourAmount,
    isDisabled,
    setFilterCutoff,
    setFilterEmphasis,
    setFilterContourAmount,
  } = useSynthStore();

  return (
    <div>
      <Title size="lg">Filter</Title>
      <Row gap="var(--spacing-xl)">
        <Knob
          valueLabels={{
            "-4": "-4",
            "-2": "-2",
            0: "0",
            2: "2",
            4: "4",
          }}
          value={filterCutoff}
          min={-4}
          max={4}
          step={0.5}
          label="Cutoff Frequency"
          onChange={setFilterCutoff}
          logarithmic={true}
          disabled={isDisabled}
        />
        <Knob
          valueLabels={{
            0: "0",
            2: "2",
            4: "4",
            6: "6",
            8: "8",
            10: "10",
          }}
          value={filterEmphasis}
          min={0}
          max={10}
          step={1}
          label="Emphasis"
          onChange={setFilterEmphasis}
          logarithmic={true}
          disabled={isDisabled}
        />
        <Knob
          valueLabels={{
            0: "0",
            2: "2",
            4: "4",
            6: "6",
            8: "8",
            10: "10",
          }}
          value={filterContourAmount}
          min={0}
          max={10}
          step={1}
          title={
            <span>
              Amount
              <br />
              of Contour
            </span>
          }
          label="Amount of Contour"
          onChange={setFilterContourAmount}
          disabled={isDisabled}
        />
      </Row>
    </div>
  );
}

export default Filter;
