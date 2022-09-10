import {createContext} from "react";
import PathStore from "@/stores/paths";
import TabStore from "@/stores/tab";
import ProtoStore from "@/stores/proto";

export const pathsStore = new PathStore();
export const tabStore = new TabStore();
export const protoStore = new ProtoStore();

export const context = createContext({pathsStore, tabStore, protoStore});