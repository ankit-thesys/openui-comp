import { defineComponent } from "@openuidev/react-lang";
import { markerPropsSchema } from "./schema";

export const MarkerComponent = defineComponent({
  name: "Marker",
  props: markerPropsSchema,
  description:
    'An event on a TimeSeries\' time axis (a deploy, incident or launch) at one of its labels: Marker("Deploy v2.4", "Oct 12").',
  component: () => null,
});
