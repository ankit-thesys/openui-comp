import { Flow, Funnel } from "../../composition/components";
import type { Group } from "../group";

// Composition owns the stylesheet shared by these charts; attach it only once.
export const flow: Group = { components: [Funnel, Flow], styles: [] };
