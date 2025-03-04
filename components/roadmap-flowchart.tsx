"use client"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  type NodeProps,
  Handle,
  Position,
  ConnectionLineType,
  MarkerType,
  BackgroundVariant,
} from "reactflow"
import { ChevronDown, ChevronUp, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import "reactflow/dist/style.css"
import QuizModal from "./quiz-modal"
import TopicSummaryModal from "./topic-summary-modal"

// Define the topic structure
interface Topic {
  id: string
  name: string
  children: string[]
  description?: string
  chapter?: string
  section?: string
  completed?: boolean
  relatedTopics?: {
    topicId: string
    relationship: string
    strength: number // 0-1, indicating how strongly topics are related
  }[]
}

interface SyllabusRoadmapProps {
  topics: Topic[]
  className: string
  onTopicComplete?: (topicId: string) => void
}

// Custom node component for the main class node
const MainNode = ({ data }: NodeProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-4 rounded-lg bg-indigo-600 text-white shadow-lg border-2 border-indigo-700 min-w-[220px] hover:scale-105 transition-transform duration-200">
      <div className="text-lg font-bold">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 text-indigo-100 text-center max-w-[220px]">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-300 !w-3 !h-3" />
    </div>
  )
}

// Custom node component for chapter nodes
const ChapterNode = ({ data }: NodeProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-lg bg-blue-500 text-white shadow-md border-2 border-blue-600 min-w-[200px] hover:scale-105 transition-transform duration-200">
      <div className="font-semibold text-center">{data.label}</div>
      {data.completed && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!bg-blue-300 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-300 !w-2 !h-2" />
    </div>
  )
}

// Custom node component for section nodes
const SectionNode = ({ data }: NodeProps) => {
  const [expanded, setExpanded] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  return (
    <div
      className={`flex flex-col px-4 py-3 rounded-lg bg-white shadow-sm border-2 border-slate-200 
      hover:shadow-md transition-all duration-200 min-w-[180px] max-w-[280px]
      ${data.isHighlighted ? "ring-2 ring-purple-400 ring-offset-2" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-500">{data.sectionNumber}</div>
        {data.description && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
      <div className="font-semibold text-slate-800 text-center my-1">{data.label}</div>
      {expanded && data.description && (
        <div className="text-xs mt-1 text-slate-600 border-t border-slate-100 pt-2">{data.description}</div>
      )}
      <div className="flex justify-center gap-2 mt-2">
        <button
          onClick={() => setShowSummary(true)}
          className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
        >
          View Summary
        </button>
        <button
          onClick={() => setShowQuiz(true)}
          className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
        >
          Take Quiz
        </button>
      </div>
      {data.completed && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
      {showQuiz && (
        <QuizModal
          topicName={data.label}
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          onComplete={() => {
            if (data.onComplete) {
              data.onComplete(data.id)
            }
            setShowQuiz(false)
          }}
        />
      )}
      {showSummary && (
        <TopicSummaryModal
          topicName={data.label}
          isOpen={showSummary}
          onClose={() => setShowSummary(false)}
          className={data.className}
          topicId={data.id}
        />
      )}
    </div>
  )
}

// Custom node component for subsection nodes
const SubsectionNode = ({ data }: NodeProps) => {
  return (
    <div className="flex flex-col px-3 py-2 rounded-lg bg-slate-50 shadow-sm border border-slate-200 hover:bg-slate-100 transition-all duration-200 min-w-[160px] max-w-[240px]">
      <Handle type="target" position={Position.Top} className="!bg-slate-300 !w-1.5 !h-1.5" />
      <div className="text-xs font-medium text-slate-500">{data.sectionNumber}</div>
      <div className="font-medium text-slate-700 text-sm text-center">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-300 !w-1.5 !h-1.5" />
    </div>
  )
}

// Node types mapping - Moved outside component to prevent recreation on each render
const nodeTypes = {
  main: MainNode,
  chapter: ChapterNode,
  section: SectionNode,
  subsection: SubsectionNode,
} as const

export default function SyllabusRoadmap({ topics, className, onTopicComplete }: SyllabusRoadmapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [zoomLevel, setZoomLevel] = useState(1)

  // Create a node for each topic with improved layout
  const createNodesAndEdges = useCallback(() => {
    if (!topics || !topics.length) return

    const newNodes: Node[] = []
    const newEdges: Edge[] = []

    // Group topics by chapter
    const chapterMap = new Map<string, Topic[]>()
    const topLevelTopics: Topic[] = []

    topics.forEach((topic) => {
      // Extract chapter number if available
      const chapterMatch = topic.name.match(/Chapter\s+(\d+)/)
      if (chapterMatch) {
        const chapterNum = chapterMatch[1]
        if (!chapterMap.has(chapterNum)) {
          chapterMap.set(chapterNum, [])
        }
        chapterMap.get(chapterNum)?.push(topic)
      } else if (!topic.chapter) {
        topLevelTopics.push(topic)
      }
    })

    // Add main class node
    newNodes.push({
      id: "main",
      type: "main",
      data: {
        label: className,
        description: `Complete syllabus for ${className}`,
      },
      position: { x: 400, y: 0 },
    })

    // Add chapter nodes
    let yOffset = 120
    const xCenter = 400
    const chapterSpacing = 180

    // Sort chapters numerically
    const sortedChapters = Array.from(chapterMap.keys()).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

    // Create a map to store chapter dependencies
    const chapterDependencies = new Map()

    // Process chapters
    sortedChapters.forEach((chapterNum, index) => {
      const chapterTopics = chapterMap.get(chapterNum) || []
      const mainChapterTopic = chapterTopics.find(
        (t) => t.name.startsWith(`Chapter ${chapterNum}`) && !t.name.includes("."),
      )

      if (mainChapterTopic) {
        // Add chapter node
        const chapterId = `chapter-${chapterNum}`
        newNodes.push({
          id: chapterId,
          type: "chapter",
          data: {
            label: mainChapterTopic.name,
            chapterNum,
          },
          position: { x: xCenter, y: yOffset },
        })

        // Connect to main node
        newEdges.push({
          id: `main-to-${chapterId}`,
          source: "main",
          target: chapterId,
          type: "smoothstep",
          style: { stroke: "#818cf8", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#818cf8",
            width: 15,
            height: 15,
          },
        })

        // Add interdisciplinary connections between chapters
        topics.forEach(topic => {
          if (topic.relatedTopics) {
            topic.relatedTopics.forEach(relation => {
              const sourceId = `chapter-${topic.chapter}`
              const targetId = `chapter-${topics.find(t => t.id === relation.topicId)?.chapter}`
              
              if (sourceId && targetId && sourceId !== targetId) {
                newEdges.push({
                  id: `${sourceId}-to-${targetId}-relation`,
                  source: sourceId,
                  target: targetId,
                  type: "smoothstep",
                  animated: true,
                  style: {
                    stroke: relation.strength >= 0.7 ? "#ef4444" : // Strong (red)
                           relation.strength >= 0.4 ? "#f97316" : // Medium (orange)
                           "#3b82f6", // Weak (blue)
                    strokeWidth: Math.max(1, relation.strength * 4),
                    opacity: 0.6 + relation.strength * 0.4,
                  },
                  data: {
                    relationship: relation.relationship,
                    strength: relation.strength,
                    tooltip: `${relation.relationship} (${Math.round(relation.strength * 100)}% strength)`
                  }
                })
              }
            })
          }
        })

        // Add sequential chapter connections
        if (index > 0) {
          const prevChapterId = `chapter-${sortedChapters[index - 1]}`
          newEdges.push({
            id: `${prevChapterId}-to-${chapterId}`,
            source: prevChapterId,
            target: chapterId,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#818cf8", strokeWidth: 1, opacity: 0.5 },
          })
        }

        // Process sections within this chapter
        const sectionTopics = topics.filter((t) => {
          const sectionMatch = t.name.match(/^(\d+\.\d+):/)
          return sectionMatch && t.name.startsWith(`${chapterNum}.`)
        })

        // Sort sections by their number
        sectionTopics.sort((a, b) => {
          const aMatch = a.name.match(/^(\d+\.\d+):/)
          const bMatch = b.name.match(/^(\d+\.\d+):/)
          if (aMatch && bMatch) {
            return Number.parseFloat(aMatch[1]) - Number.parseFloat(bMatch[1])
          }
          return 0
        })

        // Add section nodes
        const sectionSpacing = 160
        const sectionsPerRow = 3
        const sectionYOffset = yOffset + 100

        sectionTopics.forEach((sectionTopic, sectionIndex) => {
          const sectionMatch = sectionTopic.name.match(/^(\d+\.\d+):/)
          if (!sectionMatch) return

          const sectionNum = sectionMatch[1]
          const sectionName = sectionTopic.name.replace(/^\d+\.\d+:\s*/, "").trim()

          // Calculate position for section nodes (in rows of 3)
          const row = Math.floor(sectionIndex / sectionsPerRow)
          const col = sectionIndex % sectionsPerRow
          const rowWidth = Math.min(sectionsPerRow, sectionTopics.length - row * sectionsPerRow) * 300
          const startX = xCenter - rowWidth / 2 + 150

          const sectionId = `section-${sectionNum.replace(".", "-")}`
          newNodes.push({
            id: sectionId,
            type: "section",
            data: {
              label: sectionName,
              sectionNumber: sectionNum,
              description: sectionTopic.description || "",
              isHighlighted: sectionIndex === 0,
            },
            position: {
              x: startX + col * 300,
              y: sectionYOffset + row * 180,
            },
          })

          // Connect to chapter node
          newEdges.push({
            id: `${chapterId}-to-${sectionId}`,
            source: chapterId,
            target: sectionId,
            type: "smoothstep",
            style: { stroke: "#93c5fd", strokeWidth: 1.5 },
          })

          // Process subsections
          const subsectionTopics = topics.filter((t) => {
            const subsectionMatch = t.name.match(new RegExp(`^(${sectionNum}\\.\\d+):`))
            return subsectionMatch
          })

          // Sort subsections
          subsectionTopics.sort((a, b) => {
            const aMatch = a.name.match(/^(\d+\.\d+\.\d+):/)
            const bMatch = b.name.match(/^(\d+\.\d+\.\d+):/)
            if (aMatch && bMatch) {
              return Number.parseFloat(aMatch[1].replace(/\./g, "")) - Number.parseFloat(bMatch[1].replace(/\./g, ""))
            }
            return 0
          })

          // Add subsection nodes
          if (subsectionTopics.length > 0) {
            const subsectionSpacing = 140
            const subsectionYOffset = sectionYOffset + row * 180 + 100

            subsectionTopics.forEach((subsectionTopic, subsectionIndex) => {
              const subsectionMatch = subsectionTopic.name.match(/^(\d+\.\d+\.\d+):/)
              if (!subsectionMatch) return

              const subsectionNum = subsectionMatch[1]
              const subsectionName = subsectionTopic.name.replace(/^\d+\.\d+\.\d+:\s*/, "").trim()

              const subsectionId = `subsection-${subsectionNum.replace(/\./g, "-")}`
              newNodes.push({
                id: subsectionId,
                type: "subsection",
                data: {
                  label: subsectionName,
                  sectionNumber: subsectionNum,
                },
                position: {
                  x: startX + col * 300,
                  y: subsectionYOffset + subsectionIndex * subsectionSpacing,
                },
              })

              // Connect to section node
              newEdges.push({
                id: `${sectionId}-to-${subsectionId}`,
                source: sectionId,
                target: subsectionId,
                type: "smoothstep",
                style: { stroke: "#e2e8f0", strokeWidth: 1 },
              })
            })
          }
        })

        // Update yOffset for next chapter based on sections
        const rowCount = Math.ceil(sectionTopics.length / sectionsPerRow)
        const sectionHeight = rowCount * 180
        const subsectionCount = Math.max(
          ...sectionTopics.map((s) => {
            return topics.filter((t) => {
              const subsectionMatch = t.name.match(new RegExp(`^(${s.name.match(/^(\d+\.\d+):/)?.[1]}\\.\\d+):`))
              return subsectionMatch
            }).length
          }),
        )

        yOffset += 100 + sectionHeight + subsectionCount * 140 + 80
      }
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [topics, className, setNodes, setEdges])

  useEffect(() => {
    createNodesAndEdges()
  }, [createNodesAndEdges])

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.4))
  }

  return (
    <div className="w-full h-[800px] bg-gradient-to-b from-slate-50 to-indigo-50 rounded-xl overflow-hidden border border-slate-200 shadow-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultViewport={{ x: 0, y: 0, zoom: zoomLevel }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        connectionLineType={ConnectionLineType.SmoothStep}
        zoomOnScroll={true}
        panOnScroll={true}
        selectionOnDrag={false}
      >
        <Background color="#e2e8f0" gap={20} size={1} variant={BackgroundVariant.Dots} />

        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={18} className="text-slate-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={18} className="text-slate-700" />
          </button>
          <button
            onClick={() => createNodesAndEdges()}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors"
            title="Reset view"
          >
            <RefreshCw size={18} className="text-slate-700" />
          </button>
        </Panel>
      </ReactFlow>
    </div>
  )
}

