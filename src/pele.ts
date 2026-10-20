import { register, render } from 'pele/core'
import classDiagram from 'pele/diagrams/class'
import er from 'pele/diagrams/er'
import flowchart from 'pele/diagrams/flowchart'
import gantt from 'pele/diagrams/gantt'
import gitGraph from 'pele/diagrams/gitGraph'
import mindmap from 'pele/diagrams/mindmap'
import pie from 'pele/diagrams/pie'
import quadrantChart from 'pele/diagrams/quadrantChart'
import sankey from 'pele/diagrams/sankey'
import sequence from 'pele/diagrams/sequence'
import state from 'pele/diagrams/state'
import timeline from 'pele/diagrams/timeline'
import xychart from 'pele/diagrams/xychart'

register(flowchart, sequence, state, classDiagram, er, pie, gantt, xychart, timeline, mindmap, quadrantChart, gitGraph, sankey)

export { render }
