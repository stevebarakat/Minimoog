import Knob from "../Knob";
import Row from "../Row";
import Title from "../Title";
import { useSynthStore } from "@/store/synthStore";
import Column from "../Column";

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
    <Column style={{ left: "-0.375rem" }}>
      <Title size="lg">Filter</Title>
      <Row gap="var(--spacing-xl)">
        <Knob
          valueLabels={{
            "-4": "-4",
            "-2": "-2",
            0: "0",
            2: "2",
            3.9: "3.9",
          }}
          value={filterCutoff}
          min={-4}
          max={3.9}
          step={0.1}
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
    </Column>
  );
}

export default Filter;
