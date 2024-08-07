import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@grafana/ui';

import { FlatObject, Option } from '../../types';
import { FunctionsRow } from './FunctionsRow';
import { FunctionsNamesEnum, functionsConfigs } from './searchFunctionsMeta';
import RatioPairFunc, { RatioParams } from './RatioPairFunc';
import PairsFunc, { PairsParams } from './PairsFunc';
import TimeShiftFunc, { TimeShiftParams } from './TimeShift';
import AliasFunc, { AliasParams } from './AliasFun';

export type FunctionsProps = {
  selectedFunctions: Record<FunctionsNamesEnum, any>;
  onChangeFunctions(f: FlatObject<any>): void;
  groupByPropertiesList: string[];
  getMetricsOptions(str: string): Promise<any>;
  selectedMeasure?: string;
};

const functionsOptions = Object.values(functionsConfigs).map((s) => ({ label: s.displayName, value: s.name }));

const FunctionsControl: React.FC<FunctionsProps> = ({
  selectedFunctions = {},
  onChangeFunctions,
  groupByPropertiesList,
  getMetricsOptions,
  selectedMeasure,
}) => {
  const [nestCounter, setCounter] = useState(0);

  const availableFunctions = useMemo(() => {
    const selectedKeys = Object.keys(selectedFunctions);
    return functionsOptions.filter((f) => !selectedKeys.includes(f.value) && f.value !== 'new');
  }, [selectedFunctions, functionsOptions]);

  const onFunctionChange = useCallback(
    (
      funcId: FunctionsNamesEnum,
      newSelectedFunc: Option<FunctionsNamesEnum> | null,
      fParams: RatioParams | PairsParams | FlatObject | TimeShiftParams | AliasParams | null
    ) => {
      const newFunctions = { ...selectedFunctions };
      const func = {
        functionName: newSelectedFunc?.value || newFunctions[funcId]?.functionName,
        functionLabel: newSelectedFunc?.label || newFunctions[funcId]?.functionLabel,
        parameters: !!fParams ? fParams : newFunctions[funcId]?.parameters,
        index: newFunctions[funcId]?.index,
      };
      newFunctions[func.functionName] = func;
      if (funcId !== func.functionName) {
        delete newFunctions[funcId];
      }
      onChangeFunctions(newFunctions);
    },
    [selectedFunctions]
  );

  const onDelete = useCallback(
    (id) => {
      const newQuery = { ...selectedFunctions };
      delete newQuery[id];
      onChangeFunctions(newQuery);
    },
    [selectedFunctions]
  );

  const onAdd = useCallback(() => {
    onChangeFunctions({
      ...selectedFunctions,
      new: { functionLabel: '', functionName: null, parameters: {}, index: nestCounter + 1 },
    });
    setCounter(nestCounter + 1);
  }, [selectedFunctions, nestCounter]);

  return (
    <>
      {(Object.keys(selectedFunctions) as FunctionsNamesEnum[]).map((funcName, i) => {
        const selectedFunction = {
          label: `Function ${i + 1}`,
          options: availableFunctions,
          value: {
            label: selectedFunctions[funcName]?.functionLabel,
            value: selectedFunctions[funcName]?.functionName,
          },
          onChange: (newSelectedFunc: Option<FunctionsNamesEnum>) =>
            onFunctionChange(funcName as FunctionsNamesEnum, newSelectedFunc, null),
        };
        const sharedProps = {
          selectedFunction,
          groupByPropertiesList,
          getMetricsOptions,
          selectedMeasure,
        };
        if (funcName === FunctionsNamesEnum.RATIO_PAIRS) {
          return (
            <RatioPairFunc
              key={funcName}
              onDelete={() => onDelete(funcName)}
              onParamsChange={(value) => onFunctionChange(funcName, null, value)}
              paramsValue={selectedFunctions[funcName]?.parameters}
              {...sharedProps}
            />
          );
        } else if (funcName === FunctionsNamesEnum.PAIRS) {
          return (
            <PairsFunc
              key={funcName}
              onDelete={() => onDelete(funcName)}
              onParamsChange={(value) => onFunctionChange(funcName, null, value)}
              paramsValue={selectedFunctions[funcName]?.parameters}
              functionConfig={functionsConfigs[funcName]}
              {...sharedProps}
            />
          );
        } else if (funcName === FunctionsNamesEnum.TIME_SHIFT) {
          return (
            <TimeShiftFunc
              key={funcName}
              onDelete={() => onDelete(funcName)}
              onParamsChange={(value) => onFunctionChange(funcName, null, value)}
              paramsValue={selectedFunctions[funcName]?.parameters}
              functionConfig={functionsConfigs[funcName]}
              selectedFunction={selectedFunction}
            />
          );
        } else if (funcName === FunctionsNamesEnum.ALIAS) {
          return (
            <AliasFunc
              key={funcName}
              onDelete={() => onDelete(funcName)}
              onParamsChange={(value) => onFunctionChange(funcName, null, value)}
              paramsValue={selectedFunctions[funcName]?.parameters}
              selectedFunction={selectedFunction}
            />
          );
        } else {
          return (
            <FunctionsRow
              key={funcName}
              functionConfig={functionsConfigs[funcName]}
              onDelete={() => onDelete(funcName)}
              onParamsChange={(value) => onFunctionChange(funcName, null, value)}
              paramsValue={selectedFunctions[funcName].parameters}
              index={i}
              {...sharedProps}
            />
          );
        }
      })}
      {!Object.keys(selectedFunctions).includes(FunctionsNamesEnum.RATIO_PAIRS) &&
        !Object.keys(selectedFunctions).includes(FunctionsNamesEnum.PAIRS) &&
        !Object.keys(selectedFunctions).includes(FunctionsNamesEnum.TIME_SHIFT) && (
          <Button
            style={{ width: 112 }}
            disabled={!availableFunctions.length || 'new' in selectedFunctions}
            onClick={onAdd}
          >
            + {Object.keys(selectedFunctions).length > 0 && 'Child '}Function
          </Button>
        )}
    </>
  );
};

export default FunctionsControl;
