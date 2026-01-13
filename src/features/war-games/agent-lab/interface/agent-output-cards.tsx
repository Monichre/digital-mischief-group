"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCompleteAgentCode } from "../lib/agent-code-extractor";
import { AgentCodePreview } from "./agent-code-preview";
import { MemoizedReactMarkdown } from "./markdown-renderer";

// Add this helper function at the top of the file
function formatMarkdownContent(content: any): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
}

export const AgentOutputCards = {
  "multi-step-tool-usage": {
    renderOutput: (output: any) => (
      <div className="space-y-4 p-1">
        {/* Copy and Preview Buttons for Agent Code */}
        <div className="flex justify-end gap-2">
          <AgentCodePreview
            agentType="multi-step-tool-usage"
            className="mb-2"
            code={getCompleteAgentCode("multi-step-tool-usage")}
          />
          <CopyButton
            className="mb-2"
            text={getCompleteAgentCode("multi-step-tool-usage")}
          />
        </div>
        <AnimatePresence mode="wait">
          {(output.steps || []).map((step: any, index: number) => (
            <motion.div
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              initial={{ opacity: 0, x: -20, height: 0 }}
              key={index}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden rounded-2xl border-none p-4 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)] transition-all duration-300">
                <motion.div
                  animate={{ scaleY: 1 }}
                  className="absolute top-0 left-0 h-full w-1 bg-blue-500"
                  initial={{ scaleY: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                />
                <div className="ml-2">
                  <div className="mb-2 flex items-center gap-2">
                    <motion.div
                      animate={{ scale: 1 }}
                      initial={{ scale: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        delay: index * 0.1,
                      }}
                    >
                      <Badge
                        className="transition-colors"
                        variant="outline"
                      >{`Step ${index + 1}`}</Badge>
                    </motion.div>
                    {step.tool && (
                      <motion.div
                        animate={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                      >
                        <Badge className="text-xs" variant="secondary">
                          {step.tool}
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <MemoizedReactMarkdown>
                      {formatMarkdownContent(
                        step.text || step.output || step.result || ""
                      )}
                    </MemoizedReactMarkdown>
                    {step.result && (
                      <div className="mt-2 border-t pt-2">
                        <div className="mb-1 font-medium text-neutral-600 text-sm">
                          Result:
                        </div>
                        <MemoizedReactMarkdown>
                          {formatMarkdownContent(step.result)}
                        </MemoizedReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    ),
  },

  "sequential-processing": {
    renderOutput: (output: any) => (
      <div className="space-y-4 p-1">
        {/* Copy and Preview Buttons for Agent Code */}
        <div className="flex justify-end gap-2">
          <AgentCodePreview
            agentType="sequential-processing"
            className="mb-2"
            code={getCompleteAgentCode("sequential-processing")}
          />
          <CopyButton
            className="mb-2"
            text={getCompleteAgentCode("sequential-processing")}
          />
        </div>
        <AnimatePresence>
          {output.steps?.map((step: any, index: number) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
              key={index}
              transition={{ duration: 0.3, delay: index * 0.2 }}
            >
              <Card className="rounded-2xl border-none p-4 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)] transition-all duration-200">
                <div className="mb-3 flex items-center gap-2">
                  <Badge
                    className={cn("transition-colors", {
                      "border-blue-200 bg-blue-50 hover:bg-blue-100":
                        index === 0,
                      "border-green-200 bg-green-50 hover:bg-green-100":
                        index === 1,
                      "border-purple-200 bg-purple-50 hover:bg-purple-100":
                        index === 2,
                    })}
                    variant="outline"
                  >
                    {step.step}
                  </Badge>
                  <motion.div
                    animate={{ width: "100%" }}
                    className="h-1 flex-1 overflow-hidden rounded bg-neutral-100"
                    initial={{ width: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{ width: "100%" }}
                      className={cn("h-1 rounded", {
                        "bg-blue-500": index === 0,
                        "bg-green-500": index === 1,
                        "bg-purple-500": index === 2,
                      })}
                      initial={{ width: "0%" }}
                      transition={{ duration: 0.8 }}
                    />
                  </motion.div>
                </div>
                <MemoizedReactMarkdown>
                  {formatMarkdownContent(step.output)}
                </MemoizedReactMarkdown>
              </Card>
            </motion.div>
          ))}
          {output.finalOutput && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-sm dark:prose-invert max-w-none rounded-[1.25rem] p-1 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]"
              initial={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.3,
                delay: (output.steps?.length || 0) * 0.2,
              }}
            >
              <Card className="rounded-2xl border-none p-4 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)] transition-all duration-200">
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="secondary">Final Output</Badge>
                </div>
                <MemoizedReactMarkdown>
                  {formatMarkdownContent(output.finalOutput)}
                </MemoizedReactMarkdown>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),
  },

  routing: {
    renderOutput: (output: any) => (
      <div className="space-y-4 p-1">
        {/* Copy and Preview Buttons for Agent Code */}
        <div className="flex justify-end gap-2">
          <AgentCodePreview
            agentType="routing"
            className="mb-2"
            code={getCompleteAgentCode("routing")}
          />
          <CopyButton className="mb-2" text={getCompleteAgentCode("routing")} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-2xl border-none p-4 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)] transition-all duration-300">
              <div className="mb-4 flex items-center gap-2">
                <motion.div
                  animate={{ scale: 1 }}
                  initial={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Badge
                    className={cn("transition-colors", {
                      "border-blue-200 bg-blue-50":
                        output.classification?.type === "general",
                      "border-green-200 bg-green-50":
                        output.classification?.type === "technical",
                      "border-purple-200 bg-purple-50":
                        output.classification?.type === "creative",
                    })}
                    variant="outline"
                  >
                    {output.classification?.type || "Processing"}
                  </Badge>
                </motion.div>
                <motion.div
                  animate={{ width: "auto", opacity: 1 }}
                  initial={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </motion.div>
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="text-neutral-600 text-sm"
                  initial={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  {output.classification?.reasoningText || "Analyzing query..."}
                </motion.div>
              </div>
              <motion.div
                animate={{ opacity: 1 }}
                className="border-t pt-4"
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="group relative text-neutral-600 text-sm">
                  <MemoizedReactMarkdown>
                    {output.response ||
                      output.text?.text?.text ||
                      "Processing response..."}
                  </MemoizedReactMarkdown>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    ),
  },

  "parallel-processing": {
    renderOutput: (output: any) => (
      <div className="space-y-4 p-1">
        {/* Copy and Preview Buttons for Agent Code */}
        <div className="flex justify-end gap-2">
          <AgentCodePreview
            agentType="parallel-processing"
            className="mb-2"
            code={getCompleteAgentCode("parallel-processing")}
          />
          <CopyButton
            className="mb-2"
            text={getCompleteAgentCode("parallel-processing")}
          />
        </div>
        <AnimatePresence mode="wait">
          {output.results?.map((result: any, index: number) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
              key={index}
              transition={{ duration: 0.3, delay: index * 0.15 }}
            >
              <Card className="rounded-2xl border-none p-4 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)] transition-all duration-300">
                <div className="mb-3 flex items-center gap-2">
                  <motion.div
                    animate={{ scale: 1 }}
                    initial={{ scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      delay: index * 0.1,
                    }}
                  >
                    <Badge
                      className={cn("transition-colors", {
                        "border-blue-200 bg-blue-50": index === 0,
                        "border-green-200 bg-green-50": index === 1,
                        "border-purple-200 bg-purple-50": index === 2,
                      })}
                      variant="outline"
                    >
                      {result.task || `Worker ${index + 1}`}
                    </Badge>
                  </motion.div>
                </div>
                <motion.div
                  animate={{ opacity: 1 }}
                  className="group relative text-neutral-600 text-sm"
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.15 + 0.2 }}
                >
                  <MemoizedReactMarkdown>
                    {result.result ||
                      result.output ||
                      result.text?.text?.text ||
                      ""}
                  </MemoizedReactMarkdown>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    ),
  },

  "orchestrator-worker": {
    renderOutput: (output: any) => (
      <div className="space-y-4 p-1">
        {/* Copy and Preview Buttons for Agent Code */}
        <div className="flex justify-end gap-2">
          <AgentCodePreview
            agentType="orchestrator-worker"
            className="mb-2"
            code={getCompleteAgentCode("orchestrator-worker")}
          />
          <CopyButton
            className="mb-2"
            text={getCompleteAgentCode("orchestrator-worker")}
          />
        </div>
        <Card className="rounded-2xl border-none p-4 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]">
          <h3 className="mb-3 font-medium text-sm">Task Breakdown</h3>
          <div className="space-y-3">
            {output.plan?.tasks.map((task: any, index: number) => (
              <div className="flex items-start gap-3" key={index}>
                <Badge variant="outline">{index + 1}</Badge>
                <div>
                  <div className="font-medium text-sm">{task.name}</div>
                  <div className="text-neutral-600 text-sm">
                    {task.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-4">
          {output.results?.map((result: any, index: number) => (
            <Card className="p-4" key={index}>
              <div className="mb-2 flex items-center gap-2">
                <Badge>{result.task}</Badge>
                <Badge variant="outline">Worker {index + 1}</Badge>
              </div>
              <MemoizedReactMarkdown>{result.result}</MemoizedReactMarkdown>
            </Card>
          ))}
        </div>
      </div>
    ),
  },

  "evaluator-optimizer": {
    renderOutput: (output: any) => (
      <div className="space-y-4 p-1">
        {/* Copy and Preview Buttons for Agent Code */}
        <div className="flex justify-end gap-2">
          <AgentCodePreview
            agentType="evaluator-optimizer"
            className="mb-2"
            code={getCompleteAgentCode("evaluator-optimizer")}
          />
          <CopyButton
            className="mb-2"
            text={getCompleteAgentCode("evaluator-optimizer")}
          />
        </div>
        <AnimatePresence mode="wait">
          {output.iterations?.map((iteration: any, index: number) => (
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              key={index}
              transition={{ duration: 0.3, delay: index * 0.15 }}
            >
              <Card className="rounded-2xl border-none p-4 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)] transition-all duration-300">
                <div className="mb-3 flex items-center justify-between">
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.15 + 0.2 }}
                  >
                    <Badge variant="outline">
                      Iteration {iteration.iteration}
                    </Badge>
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: 1 }}
                      className="text-neutral-500 text-xs"
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}
                    >
                      Quality:
                    </motion.div>
                    <motion.div
                      animate={{ width: "96px" }}
                      className="h-2 w-24 overflow-hidden rounded bg-neutral-100"
                      initial={{ width: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.15 + 0.4 }}
                    >
                      <motion.div
                        animate={{
                          width: `${(iteration.evaluation.quality / 10) * 100}%`,
                        }}
                        className={cn("h-2 rounded transition-all", {
                          "bg-red-500": iteration.evaluation.quality < 5,
                          "bg-yellow-500":
                            iteration.evaluation.quality >= 5 &&
                            iteration.evaluation.quality < 8,
                          "bg-green-500": iteration.evaluation.quality >= 8,
                        })}
                        initial={{ width: 0 }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.15 + 0.5,
                        }}
                      />
                    </motion.div>
                    <motion.div
                      animate={{ opacity: 1, x: 0 }}
                      className="font-medium text-xs"
                      initial={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.15 + 0.6 }}
                    >
                      {iteration.evaluation.quality}/10
                    </motion.div>
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.15 + 0.7 }}
                >
                  <div
                    className={cn(
                      "rounded-xl p-4 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]",
                      {
                        "bg-red-50/30": iteration.evaluation.quality < 5,
                        "bg-yellow-50/30":
                          iteration.evaluation.quality >= 5 &&
                          iteration.evaluation.quality < 8,
                        "bg-green-50/30": iteration.evaluation.quality >= 8,
                      }
                    )}
                  >
                    <Badge variant="outline">
                      Iteration {iteration.iteration} Feedback:
                    </Badge>

                    <MemoizedReactMarkdown>
                      {iteration.evaluation.feedback}
                    </MemoizedReactMarkdown>
                  </div>
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-3"
                    initial={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: index * 0.15 + 0.8 }}
                  >
                    <div
                      className={cn(
                        "rounded-xl p-4 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]",
                        {
                          "bg-red-50/30": iteration.evaluation.quality < 5,
                          "bg-yellow-50/30":
                            iteration.evaluation.quality >= 5 &&
                            iteration.evaluation.quality < 8,
                          "bg-green-50/30": iteration.evaluation.quality >= 8,
                        }
                      )}
                    >
                      <div className="mb-1 font-bold font-mono text-neutral-500 text-xs uppercase" />
                      <Badge variant="outline">
                        Iteration {iteration.iteration} Output:
                      </Badge>
                      <div className="group relative text-neutral-600 text-sm">
                        <MemoizedReactMarkdown>
                          {iteration.output}
                        </MemoizedReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    ),
  },
};
