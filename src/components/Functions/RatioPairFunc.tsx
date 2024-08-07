import React from 'react';
import FormSelect from '../FormField/FormSelect';
import { IconButton, InlineFormLabel, Select } from '@grafana/ui';
import { addLabel, arrayToOptions } from '../../utils/helpers';
import MetricSearchField from '../MetricSearchField';
import { FlatObject, Option } from '../../types';
import { css, cx } from 'emotion';
import { aggregationKeys } from './searchFunctionsMeta';

const iconWrapperClass = `gf-form ${cx(
  css`
    align-items: center;
    margin-left: 5px;
  `
)}`;
export type RatioParams = {
  dividentMeasure?: Option;
  dividentAggregation: Option;
  dividentGroupBy: string;

  divisorMeasure: Option;
  divisorAggregation: Option;
  divisorGroupBy: string;
};
type RatioPairFuncProps = {
  selectedFunction: FlatObject<any>;
  paramsValue: RatioParams;
  onDelete(): void;
  onParamsChange(params: RatioParams): void;
  groupByPropertiesList: string[];
  getMetricsOptions(str: string): Promise<any>;
  selectedMeasure?: string;
};

const RatioPairFunc: React.FC<RatioPairFuncProps> = ({
  selectedFunction = {},
  onDelete,
  onParamsChange,
  paramsValue = {} as RatioParams,
  groupByPropertiesList,
  getMetricsOptions,
  selectedMeasure,
}) => {
  return (
    <>
      <div className="gf-form-inline">
        <div className="gf-form gf-form--grow">
          <FormSelect
            disabled={selectedFunction.disabled}
            label={selectedFunction.label}
            tooltip={selectedFunction.tooltip}
            inputWidth={0}
            value={selectedFunction.value}
            options={selectedFunction.options}
            onChange={selectedFunction.onChange}
            menuPlacement={'top'}
          />
        </div>
        <div className={iconWrapperClass}>
          <IconButton aria-label="trash" onClick={onDelete} name={'trash-alt'} size={'xl'} />
        </div>
      </div>
      <div className="gf-form-inline">
        <div style={{ width: 20 }} />
        <div className="gf-form">
          <MetricSearchField
            placeholder={'Any Measure'}
            isClearable
            getMetricsOptions={getMetricsOptions}
            value={addLabel(selectedMeasure)}
            onChange={(value) => {
              onParamsChange({ ...paramsValue, dividentMeasure: value });
            }}
            label="Divident measure"
            disabled
          />
        </div>
        <InlineFormLabel>Group By:</InlineFormLabel>
        <div className="gf-form">
          <Select
            menuPlacement={'top'}
            value={paramsValue.dividentAggregation}
            options={arrayToOptions(aggregationKeys)}
            onChange={(value) => {
              onParamsChange({ ...paramsValue, dividentAggregation: value });
            }}
          />
        </div>
        <div className="gf-form gf-form--grow">
          <Select
            isMulti
            menuPlacement={'top'}
            value={paramsValue.dividentGroupBy && JSON.parse(paramsValue.dividentGroupBy)?.properties}
            options={arrayToOptions(groupByPropertiesList)}
            onChange={(selectedOptions) => {
              const selected = selectedOptions.map((o) => o.value);
              onParamsChange({
                ...paramsValue,
                dividentGroupBy: JSON.stringify({ properties: selected }),
              });
            }}
          />
        </div>
      </div>
      <div className="gf-form-inline">
        <div style={{ width: 20 }} />
        <div className="gf-form">
          <MetricSearchField
            placeholder={'Any Measure'}
            isClearable
            getMetricsOptions={getMetricsOptions}
            value={paramsValue.divisorMeasure}
            onChange={(value) => {
              onParamsChange({ ...paramsValue, divisorMeasure: value });
            }}
            label="Divisor measure"
            menuPlacement={'top'}
          />
        </div>
        <InlineFormLabel>Group By:</InlineFormLabel>
        <div className="gf-form">
          <Select
            menuPlacement={'top'}
            value={paramsValue.divisorAggregation}
            options={arrayToOptions(aggregationKeys)}
            onChange={(value) => {
              onParamsChange({ ...paramsValue, divisorAggregation: value });
            }}
          />
        </div>
        <div className="gf-form gf-form--grow">
          <Select
            isMulti
            menuPlacement={'top'}
            value={paramsValue.divisorGroupBy && JSON.parse(paramsValue.divisorGroupBy)?.properties}
            options={arrayToOptions(groupByPropertiesList)}
            onChange={(selectedOptions) => {
              const selected = selectedOptions.map((o) => o.value);
              onParamsChange({
                ...paramsValue,
                divisorGroupBy: JSON.stringify({ properties: selected }),
              });
            }}
          />
        </div>
      </div>
    </>
  );
};

export default RatioPairFunc;
