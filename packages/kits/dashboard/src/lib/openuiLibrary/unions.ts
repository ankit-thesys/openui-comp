import { z } from "zod/v4";

import { Callout } from "./Callout";
import { CardHeader } from "./CardHeader";
import { CodeBlock } from "./CodeBlock";
import { Image } from "./Image";
import { ImageBlock } from "./ImageBlock";
import { ImageGallery } from "./ImageGallery";
import { MarkDownRenderer } from "./MarkDownRenderer";
import { Separator } from "./Separator";
import { TextCallout } from "./TextCallout";
import { TextContent } from "./TextContent";

import {
  AreaChartCondensed,
  BarChartCondensed,
  HorizontalBarChart,
  LineChartCondensed,
  PieChart,
  RadarChart,
  RadialChart,
  ScatterChart,
  SingleStackedBarChart,
} from "./Charts";

import { IconButton } from "./IconButton";
import { Table } from "./Table";
import { TagBlock } from "./TagBlock";

import { Buttons } from "./Buttons";
import { Form } from "./Form";

import { Steps } from "./Steps";

import { CompositeCardBlock } from "./CompositeCardBlock";
import { ContextCardBlock } from "./ContextCardBlock";
import { EditableTable } from "./EditableTable";
import { EntityList } from "./EntityList";
import { InlineHeader } from "./InlineHeader";
import { OverviewCardBlock } from "./OverviewCardBlock";
import { SnippetCardBlock } from "./SnippetCardBlock";
import { VisualCardBlock } from "./VisualCardBlock";

export const ContentChildUnion = z.union([
  TextContent.ref,
  MarkDownRenderer.ref,
  CardHeader.ref,
  Callout.ref,
  TextCallout.ref,
  CodeBlock.ref,
  Image.ref,
  ImageBlock.ref,
  ImageGallery.ref,
  Separator.ref,
  HorizontalBarChart.ref,
  RadarChart.ref,
  PieChart.ref,
  RadialChart.ref,
  SingleStackedBarChart.ref,
  ScatterChart.ref,
  AreaChartCondensed.ref,
  BarChartCondensed.ref,
  LineChartCondensed.ref,
  Table.ref,
  TagBlock.ref,
  Form.ref,
  Buttons.ref,
  IconButton.ref,
  Steps.ref,
  InlineHeader.ref,
  EntityList.ref,
  EditableTable.ref,
  SnippetCardBlock.ref,
  OverviewCardBlock.ref,
  ContextCardBlock.ref,
  CompositeCardBlock.ref,
  VisualCardBlock.ref,
]);
