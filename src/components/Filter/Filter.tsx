import Knob from "../Knob";
import Row from "../Row";
import Title from "../Title";
import { useSynthStore } from "@/store/synthStore";
import { useFilterState, useIsSynthDisabled } from "@/store/selectors";
import Column from "../Column";

export default function Filter() {
  const filterState = useFilterState();
  const { setFilterCutoff, setFilterEmphasis, setFilterContourAmount } =
    useSynthStore();
  const isDisabled = useIsSynthDisabled();

  return (
    <Column style={{ left: "-0.375rem" }} data-onboarding="filter">
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
          value={filterState.filterCutoff}
          min={-4}
          max={4}
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
          value={filterState.filterEmphasis}
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
          value={filterState.filterContourAmount}
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
