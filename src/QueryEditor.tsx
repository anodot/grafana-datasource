//@ts-nocheck
import defaults from 'lodash/defaults';
import React, { useState, useCallback, useEffect } from 'react';
import { Alert } from '@grafana/ui';
import { EditorQuery, QEditorProps } from './types';
import FormSelect from './components/FormField/FormSelect';
import { scenarios } from './utils/constants';
import AlertsQueryEditor from './Alerts/QueryEditor';
import AnomaliesQueryEditor from './Anomalies/QueryEditor';
import TopologyQueryEditor from './Topology/QueryEditor';
import MetricsComposite from './MetricsComposite/QueryEditor';

const scenarioOptions = {
  [scenarios.alerts]: { label: 'Alerts', value: scenarios.alerts },
  [scenarios.anomalies]: { label: 'Anomalies', value: scenarios.anomalies },
  [scenarios.metricsComposite]: { label: 'Metrics', value: scenarios.metricsComposite },
  [scenarios.topology]: { label: 'Topology Map', value: scenarios.topology },
};

const defaultQuery: Partial<EditorQuery> = {
  scenario: scenarios.alerts,
};

export const QueryEditor = (props: QEditorProps) => {
  const query = defaults(props.query, defaultQuery);

  const onFormChange = useCallback(
    (key, value, forceRunQuery = false) => {
      const newQuery = { ...query, [key]: value?.value ?? value ?? '' };
      props.onChange(newQuery);
      forceRunQuery && props.onRunQuery();
    },
    [query]
  );

  const onScenarioChange = useCallback(scenario => {
    analytics.track('grafana', {
      category: 'Switched scenario',
      scenario: scenario.value,
      ...props.datasource.analyticsData,
    });
    props.onChange({ scenario: scenario.value });
  }, []);

  const editorsProps = {
    ...props,
    onFormChange,
  };

  let editor;

  switch (query.scenario) {
    case scenarios.alerts:
      editor = <AlertsQueryEditor {...editorsProps} />;
      break;
    case scenarios.anomalies:
      editor = <AnomaliesQueryEditor {...editorsProps} />;
      break;
    case scenarios.topology:
      editor = <TopologyQueryEditor {...editorsProps} />;
      break;
    case scenarios.metricsComposite:
      editor = <MetricsComposite {...editorsProps} />;
      break;
    default:
      editor = null;
  }

  return (
    <div className={'gf-form-group'}>
      <div className={'gf-form'}>
        <FormSelect
          queryKeyword
          inputWidth={0}
          label={'Scenario'}
          tooltip={'Select scenario'}
          value={query.scenario}
          options={Object.values(scenarioOptions)}
          onChange={onScenarioChange}
        />
      </div>
      {editor}
    </div>
  );
};
