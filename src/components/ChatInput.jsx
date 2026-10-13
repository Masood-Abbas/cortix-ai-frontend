import { FileText, Mic, Paperclip, Send, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendChatMessage } from "../../features/chatActions.js";
import { agentsList } from "../../utils/staticData/agents.jsx";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");

  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);
  const speechBaseValueRef = useRef("");
  const finalTranscriptRef = useRef("");
  const restartTimeoutRef = useRef(null);

  const conversationId = useSelector(
    (state) => state.conversation.selectedConversation?._id,
  );

  const { sendRequestId, error } = useSelector((state) => state.message);

  const chat = useSelector(
    (state) => state.message.byConversation[conversationId],
  );

  const user = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();

  const disabled =
    !user || Boolean(sendRequestId) || Boolean(chat?.loading || chat?.error);

  const isSelectedImage = selectedFile?.type?.startsWith("image/");

  const previewUrl = useMemo(() => {
    return selectedFile && isSelectedImage
      ? URL.createObjectURL(selectedFile)
      : "";
  }, [selectedFile, isSelectedImage]);

  // Release image preview URL
  useEffect(() => {
    if (!previewUrl) return undefined;

    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }

      const recognition = recognitionRef.current;

      if (recognition) {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;

        try {
          recognition.abort();
        } catch {
          // Recognition may already be stopped
        }
      }

      recognitionRef.current = null;

      microphoneStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      microphoneStreamRef.current = null;
    };
  }, []);

  const clearSelectedFile = () => {
    setSelectedFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // Release microphone resources
  const releaseMicrophone = useCallback(() => {
    microphoneStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    microphoneStreamRef.current = null;
  }, []);

  // Stop speech recognition
  const stopSpeechRecognition = useCallback(() => {
    shouldKeepListeningRef.current = false;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    const recognition = recognitionRef.current;

    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped
      }
    }

    setIsListening(false);
    releaseMicrophone();
  }, [releaseMicrophone]);

  // Speech-to-text
  const handleSpeechToText = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported. Please use Chrome.");
      return;
    }

    // Clicking the microphone again stops recording
    if (shouldKeepListeningRef.current || recognitionRef.current) {
      stopSpeechRecognition();
      return;
    }

    setSpeechError("");

    shouldKeepListeningRef.current = true;
    speechBaseValueRef.current = value.trim();
    finalTranscriptRef.current = "";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false,
        },
      });

      if (!shouldKeepListeningRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      microphoneStreamRef.current = stream;

      const startRecognition = () => {
        if (!shouldKeepListeningRef.current) return;

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          if (recognitionRef.current === recognition) {
            setIsListening(true);
            setSpeechError("");
          }
        };

        recognition.onresult = (event) => {
          if (recognitionRef.current !== recognition) return;

          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0]?.transcript || "";

            if (event.results[i].isFinal) {
              finalTranscriptRef.current += `${transcript} `;
            } else {
              interimTranscript += `${transcript} `;
            }
          }

          const spokenText = (
            finalTranscriptRef.current + interimTranscript
          ).trim();

          setValue(
            [speechBaseValueRef.current, spokenText].filter(Boolean).join(" "),
          );
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);

          if (recognitionRef.current !== recognition) return;

          if (
            [
              "not-allowed",
              "service-not-allowed",
              "audio-capture",
              "language-not-supported",
            ].includes(event.error)
          ) {
            shouldKeepListeningRef.current = false;
            setIsListening(false);
            releaseMicrophone();

            const messages = {
              "not-allowed":
                "Please allow microphone access in your browser settings.",
              "service-not-allowed":
                "The browser speech recognition service is blocked.",
              "audio-capture":
                "No microphone was found. Check your microphone connection.",
              "language-not-supported":
                "The selected recognition language is not supported.",
            };

            setSpeechError(messages[event.error]);
          } else if (event.error === "network") {
            setSpeechError(
              "Speech recognition network error. Check your internet connection.",
            );
          } else if (event.error !== "no-speech" && event.error !== "aborted") {
            setSpeechError(`Speech recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          if (recognitionRef.current !== recognition) return;

          recognitionRef.current = null;

          if (!shouldKeepListeningRef.current) {
            setIsListening(false);
            releaseMicrophone();
            return;
          }

          restartTimeoutRef.current = setTimeout(() => {
            restartTimeoutRef.current = null;

            if (!shouldKeepListeningRef.current) return;

            try {
              startRecognition();
            } catch (err) {
              console.error("Recognition restart failed:", err);

              shouldKeepListeningRef.current = false;
              setIsListening(false);
              releaseMicrophone();

              setSpeechError(
                "Unable to restart speech recognition. Please try again.",
              );
            }
          }, 250);
        };

        recognitionRef.current = recognition;

        try {
          recognition.start();
        } catch (err) {
          recognitionRef.current = null;
          throw err;
        }
      };

      startRecognition();
    } catch (err) {
      console.error("Microphone initialization error:", err);

      shouldKeepListeningRef.current = false;
      setIsListening(false);
      releaseMicrophone();

      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setSpeechError(
          "Please allow microphone access in your browser settings.",
        );
      } else if (err.name === "NotFoundError") {
        setSpeechError(
          "No microphone found. Connect a microphone and try again.",
        );
      } else {
        setSpeechError("Unable to start speech recognition. Please try again.");
      }
    }
  };

  const handleSendMessage = async () => {
    const prompt = value.trim();

    const attachedFile = selectedFile || fileRef.current?.files?.[0] || null;

    if ((!prompt && !attachedFile) || disabled) return;

    stopSpeechRecognition();

    // Clear input immediately before waiting for response
    setValue("");
    clearSelectedFile();
    setSpeechError("");
    speechBaseValueRef.current = "";
    finalTranscriptRef.current = "";

    try {
      await dispatch(
        sendChatMessage({
          prompt,
          conversationId,
          agent: selectedAgent.toLowerCase(),
          file: attachedFile,
        }),
      ).unwrap();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="w-full overflow-hidden px-2 sm:px-3 md:px-5 py-3 sm:py-4 border-t border-white/6 bg-[#0d0f14]">
      {!conversationId && error && (
        <p role="alert" className="text-red-400 mb-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 bg-white/3 border border-white/7 px-3 sm:px-4 pt-3.5 pb-3 rounded-2xl">
        {/* Agent selection */}
        <div className="flex w-full gap-2 overflow-x-auto pb-1 pr-2 scrollbar-none [&::-webkit-scrollbar]:hidden sm:flex-wrap">
          {agentsList.map((agent) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;

            return (
              <button
                key={agent.label}
                type="button"
                onClick={() => setSelectedAgent(agent.label)}
                disabled={disabled}
                className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
                  isActive
                    ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                    : "bg-white/3 text-slate-400 border-white/6 hover:border-white/7"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : "text-slate-500"}
                />
                {agent.label}
              </button>
            );
          })}
        </div>

        {/* Selected file preview */}
        {selectedFile && (
          <div className="w-60 max-w-full flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            {isSelectedImage && previewUrl ? (
              <img
                src={previewUrl}
                alt={selectedFile.name}
                className="h-12 w-12 rounded-lg object-cover border border-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-indigo-300">
                <FileText size={22} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-200">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {isSelectedImage ? "Image selected" : "File selected"}
              </p>
            </div>

            <button
              type="button"
              title="Remove attachment"
              aria-label="Remove attachment"
              onClick={clearSelectedFile}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white/8 hover:text-slate-200"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Message textarea */}
        <textarea
          placeholder="Ask Anything..."
          onChange={(event) => setValue(event.target.value)}
          value={value}
          disabled={disabled || isListening}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              handleSendMessage();
            }
          }}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={3}
        />

        {/* Speech recognition error */}
        {speechError && (
          <p role="alert" className="text-xs text-red-400">
            {speechError}
          </p>
        )}

        {/* Recording status */}
        {isListening && (
          <p className="flex items-center gap-2 text-xs text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Listening... Speak now or click the microphone to stop.
          </p>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <input
              type="file"
              accept=".pdf,image/*"
              hidden
              ref={fileRef}
              disabled={isListening}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  setSelectedFile(file);
                }
              }}
            />

            {/* Attachment button */}
            <button
              type="button"
              title="Attach image or PDF"
              aria-label="Attach image or PDF"
              disabled={disabled}
              onClick={() => fileRef.current?.click()}
              className="p-2 cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/6 transition-all duration-150 disabled:opacity-40"
            >
              <Paperclip size={16} />
            </button>

            {/* Microphone button */}
            <button
              type="button"
              onClick={handleSpeechToText}
              disabled={disabled}
              title={isListening ? "Stop recording" : "Start speech to text"}
              aria-label={
                isListening ? "Stop recording" : "Start speech to text"
              }
              className={`p-2 cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
                isListening
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "text-slate-600 hover:text-slate-300 hover:bg-white/5 border-transparent"
              }`}
            >
              <Mic size={16} />
            </button>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={disabled || (!value.trim() && !selectedFile)}
            aria-label="Send message"
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150 bg-linear-to-br from-indigo-500 to-violet-700 text-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
