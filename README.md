# Grafana Data Source Plugin

This is Anodot Datasource Plugin for Grafana, which together with the [Anodot Panel Plugin](https://github.com/anodot/grafana-panel) allows users to use Anodot data for building Grafana Dashboards.

## What is Grafana Data Source Plugin?

Grafana supports a wide range of data sources, including Prometheus, MySQL, and even Datadog. There’s a good chance you can already visualize metrics from the systems you have set up. In some cases, though, you already have an in-house metrics solution that you’d like to add to your Grafana dashboards. Grafana Data Source Plugins enables integrating such solutions with Grafana.

## Using the Anodot Data Source Plugin

You can get the Anodot Data Source Plugin in these ways:

1. Clone this github repository, build the plugin and deploy it to your grafana deployment.
2. Unzip zip archive from this repository to your grafana-plugins folder.
3. Get it from the [Grafana plugins library](https://grafana.com/grafana/plugins/anodot-datasource)
4. Use grafana-cli for installation

## Installing/Updating with grafana-cli

```
grafana-cli plugins install anodot-datasource
```

or

```
grafana-cli plugins update anodot-datasource
```

Restart Grafana after installation:

```
brew services restart grafana
```

See more details [here](https://grafana.com/docs/grafana/latest/administration/cli/#plugins-commands).

Once you have the plugin installed, please go through [setting up the Anodot Data Source](https://github.com/anodot/grafana-datasource#setting-up-the-anodot-data-source).

## Building the plugin on your own

1. Install dependencies

```BASH
yarn install
```

2. Build plugin in development mode or run in watch mode

```BASH
yarn dev
```

or

```BASH
yarn watch
```

3. Build plugin in production mode

```BASH
yarn build
```

4. Optional: build the backend plugin
```BASH
mage
```

## Setting up the Anodot Data Source

Once you have the plugin installed, please follow the steps below to configure it for use:

1. You will need to set up an API token. Click here to find out how to get an Anodot Access Key. Click [here](https://support.anodot.com/hc/en-us/articles/360002631114-Token-Management-) to learn how to obtain an access key from Anodot.
2. You will need to set up your Anodot URL. For most customers - that URL is 'app.anodot.com'. You can find your URL when you log in to Anodot.
3. Once you've set these two parameters - simply hit the "Save & Test" and you are good to go.

## Learn more

- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System
