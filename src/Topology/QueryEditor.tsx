//@ts-nocheck
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';
import isEqual from 'lodash/isEqual';
import defaults from 'lodash/defaults';
import React from 'react';
import { ScenarioProps, TopologyQuery } from '../types';
import FormSelect from '../components/FormField/FormSelect';
import FormSlider from '../components/FormField/FormSlider';
import {
  deltaTypesOptions,
  directionsOptions,
  requestStrategies,
  sortAnomalyOptions,
  timeScaleOptions,
} from '../utils/constants';
import { addLabel } from '../utils/helpers';
import FormSwitch from '../components/FormField/FormSwitch';
import FormInput from '../components/FormField/FormInput';
import { SelectableValue } from '@grafana/data';
import MetricSearchField from '../components/MetricSearchField';

export const defaultTopologyQuery: Partial<TopologyQuery> = {
  deltaValue: 5,
  duration: [1],
  durationStep: 1,
  durationUnit: 'minutes',
  score: [5],
  direction: directionsOptions,
  deltaType: 'absolute',
  sortBy: 'score',
  timeScales: [timeScaleOptions[0]],
  openedOnly: false,
  showEvents: true,
  requestsStrategy: requestStrategies.all,
  metrics: [],
};

interface TopologyQueryState {
  isPristine: boolean;
  properties: SelectableValue[];
  availableOptions: SelectableValue[];
}

class TopologyQueryEditor extends React.Component<ScenarioProps<TopologyQuery>, TopologyQueryState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isPristine: true,
      properties: [],
      availableOptions: [],
    };
    const query = defaults(props.query, defaultTopologyQuery);
    props.onChange(query);
  }

  componentDidMount() {
    this.setState({ isPristine: false });
    const { metrics } = this.props.query;
    if (metrics?.length) {
      /** Request available propertyNames by selected metrics */
      const promises = metrics.map(({ value }) => this.props.datasource?.getPropertiesDict(value));
      Promise.all(promises).then((results) => {
        const properties = uniq([].concat(...results.map((d) => d.properties))).sort();
        // const propertiesOptions = properties.map(value => ({ label: value, value }));
        this.setState({ properties });
      });
    }
  }

  componentDidUpdate(
    prevProps: Readonly<ScenarioProps<TopologyQuery>>,
    prevState: Readonly<TopologyQueryState>,
    snapshot?: any
  ) {
    const { query, onChange, onRunQuery, datasource } = this.props;
    const prevQuery = prevProps.query;
    const {
      source,
      destination,
      metrics = [],
      showEvents,
      score = [0],
      duration = [0],
      deltaValue,
      direction,
      deltaType,
      timeScales,
      openedOnly,
      sortBy,
    } = query;

    if (!isEqual(metrics, prevQuery.metrics) && metrics.length) {
      /** Request available propertyNames by selected metrics */
      const promises = metrics.map(({ value }) => datasource?.getPropertiesDict(value));
      Promise.all(promises).then((results) => {
        const properties = uniq([].concat(...results.map((d) => d.properties))).sort();
        // const propertiesOptions = properties.map(value => ({ label: value, value }));
        this.setState({ properties });
      });
    }

    if (
      (!isEqual(this.state.properties, prevState.properties) ||
        source !== prevQuery.source ||
        destination !== prevQuery.destination) &&
      this.state.properties?.length
    ) {
      /** Reduce already selected propertyNames from available properties */
      let choseOptions = []; // options were already chose and are not available anymore
      source && choseOptions.push(source.value || source);
      destination && choseOptions.push(destination.value || destination);
      const availableOptions = difference(this.state.properties, choseOptions).map((value) => ({
        label: value,
        value,
      }));
      this.setState({ availableOptions });
    }

    const anomaliesParams = { score, duration, deltaValue, direction, deltaType, timeScales, openedOnly, sortBy };
    const prevAnomaliesParams = {
      score: prevQuery.score,
      duration: prevQuery.duration,
      deltaValue: prevQuery.deltaValue,
      direction: prevQuery.direction,
      deltaType: prevQuery.deltaType,
      timeScales: prevQuery.timeScales,
      openedOnly: prevQuery.openedOnly,
      sortBy: prevQuery.sortBy,
    };

    if (!isEqual(metrics, prevQuery.metrics) && !this.state.isPristine && metrics?.[0]) {
      /** Common case - make all requests, if metrics were changed */
      onChange({ ...query, requestsStrategy: requestStrategies.all });
      onRunQuery();
    }

    if (!isEqual(anomaliesParams, prevAnomaliesParams) && !this.state.isPristine && metrics?.[0]) {
      /** Request Anomalies only */
      onChange({ ...query, requestsStrategy: requestStrategies.anomaliesOnly });
      onRunQuery();
    }

    if (showEvents !== prevQuery.showEvents && !this.state.isPristine && metrics?.[0]) {
      /** Request Events only */
      onChange({ ...query, requestsStrategy: requestStrategies.eventsOnly });
      onRunQuery();
    }

    if (
      (!isEqual(source, prevQuery.source) || !isEqual(destination, prevQuery.destination)) &&
      !this.state.isPristine &&
      metrics?.[0]
    ) {
      /** Case when only local params (as Soure and Destination) were changed.
       No requests needed, update the query for the panel only */
      onChange({ ...query, requestsStrategy: requestStrategies.noRequests });
      onRunQuery();
    }
  }

  render() {
    const { query, datasource, onFormChange } = this.props;
    const { availableOptions } = this.state;
    const durationLabel = `Anomaly Duration (${query.durationStep > 1 ? query.durationStep + ' ' : ''}${
      query.durationUnit || ''
    })`;
    return (
      <>
        <div className="gf-form gf-form--grow">
          <MetricSearchField
            isMulti
            getMetricsOptions={datasource.getMetricsOptions.bind(datasource)}
            value={query.metrics}
            onChange={(value) => onFormChange('metrics', value, true)}
            required
          />
        </div>
        <div className="gf-form-inline">
          <div className="gf-form gf-form--grow">
            <FormSelect
              isClearable
              disabled={!query.metrics?.length}
              inputWidth={0}
              label={'Source'}
              tooltip={'Select a Source.'}
              value={query.source}
              options={availableOptions.concat(query.source ? [addLabel(query.source)] : [])}
              onChange={(value) => onFormChange('source', value)}
            />
          </div>
          <div className="gf-form gf-form--grow">
            <FormSelect
              isClearable
              disabled={!query.metrics?.length}
              inputWidth={0}
              label={'Destination'}
              tooltip={'Select a Destination.'}
              value={query.destination}
              options={availableOptions.concat(query.destination ? [addLabel(query.destination)] : [])}
              onChange={(value) => onFormChange('destination', value)}
            />
          </div>
        </div>
        <div className={'gf-form'}>
          <FormSlider
            min={query.durationStep}
            className="query-segment-operator"
            disabled={!query.metrics?.length}
            step={query.durationStep}
            inputWidth={0}
            label={durationLabel}
            value={query.duration}
            tooltip={'Anomaly Duration'}
            onAfterChange={(value) => onFormChange('duration', value)}
          />
          <FormSlider
            className="query-segment-operator"
            disabled={!query.metrics?.length}
            inputWidth={0}
            label={'Anomaly Score'}
            value={query.score}
            tooltip={'Anomaly Score'}
            onAfterChange={(value) => onFormChange('score', value)}
          />
        </div>
        <div className={'gf-form'}>
          <FormSelect
            className="query-segment-operator"
            disabled={!query.metrics?.length}
            isClearable
            inputWidth={0}
            label={'Anomalies Delta Type'}
            tooltip={'Anomalies Delta Type'}
            value={query.deltaType}
            options={deltaTypesOptions}
            onChange={(value) => onFormChange('deltaType', value)}
          />
          <FormInput
            className="query-segment-operator"
            disabled={!query.metrics?.length}
            isClearable
            isMulti
            inputWidth={0}
            label={'Anomalies Delta Value'}
            tooltip={'Anomalies Delta Value'}
            value={query.deltaValue}
            options={deltaTypesOptions}
            type={'number'}
            onChange={(e) => onFormChange('deltaValue', e?.currentTarget?.value)}
          />
        </div>
        <div className={'gf-form'}>
          <FormSelect
            className="query-segment-operator"
            disabled={!query.metrics?.length}
            isClearable
            isMulti
            inputWidth={0}
            label={'Anomalies Time Scale'}
            tooltip={'Select Context'}
            value={query.timeScales}
            options={timeScaleOptions}
            required
            onChange={(value) => {
              const smallestTimescale = value.sort((a, b) => a.meta[3] - b.meta[3])[0];
              const joinedChanges = {
                timeScales: value,
                // duration: [smallestTimescale.meta[0]],
                durationStep: smallestTimescale?.meta[0] || defaultTopologyQuery.durationStep,
                durationUnit: smallestTimescale?.meta[1] || defaultTopologyQuery.durationUnit,
              };
              onFormChange(joinedChanges);
            }}
          />
          <FormSwitch
            disabled={!query.metrics?.length}
            className="query-segment-operator"
            labelWidth={11}
            label={'Open Anomalies only'}
            tooltip={'Open Anomalies only'}
            value={query.openedOnly}
            onChange={(e) => onFormChange('openedOnly', e?.currentTarget?.checked)}
          />
          <FormSwitch
            disabled={!query.metrics?.length}
            className="query-segment-operator"
            labelWidth={11}
            label={'Show Events'}
            tooltip={'Open Anomalies only'}
            value={query.showEvents}
            onChange={(e) => onFormChange('showEvents', e?.currentTarget?.checked)}
          />
        </div>
        <div className={'gf-form'}>
          <FormSelect
            disabled={!query.metrics?.length}
            className="query-segment-operator"
            inputWidth={0}
            label={'Anomalies Sort Order'}
            tooltip={'Anomalies Sort Order'}
            value={query.sortBy}
            options={sortAnomalyOptions}
            onChange={(value) => onFormChange('sortBy', value)}
          />
          <FormSelect
            disabled={!query.metrics?.length}
            className="query-segment-operator"
            isMulti
            inputWidth={0}
            label={'Anomaly Direction'}
            tooltip={'Anomaly Direction'}
            value={query.direction}
            options={directionsOptions}
            onChange={(value) => onFormChange('direction', value)}
            required
          />
        </div>
        {/*<div style={{ marginBottom: 4 }}>*/}
        {/*  <DimensionsRows*/}
        {/*    key={firstMetricName}*/}
        {/*    getValues={getValues}*/}
        {/*    dimensionsQuery={JSON.parse(query.dimensions)}*/}
        {/*    onChangeDimensions={(value) => onFormChange('dimensions', JSON.stringify(value), true)}*/}
        {/*    availableDimensionsNames={availableOptions}*/}
        {/*  />*/}
        {/*</div>*/}
      </>
    );
  }
}

export default TopologyQueryEditor;
