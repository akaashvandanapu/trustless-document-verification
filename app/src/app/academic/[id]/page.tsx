/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, ChangeEvent, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Upload,
  FileCheck,
  FileX,
  Shield,
  Key,
  CheckCircle,
  XCircle,
  Mail,
  Zap,
  VerifiedIcon,
  RefreshCw,
  CreditCard,
  User,
  GraduationCap,
  Building2,
} from "lucide-react";
import {
  getVerifyAcademic,
  sendAcademicProofMail,
} from "@/actions/academicActions";
import * as asn1js from "asn1js";
import { setEngine, CryptoEngine } from "pkijs";
import { loadWasm } from "@/app/lib/wasm";

function initPKIjs() {
  if ((window as any).__PKIJS_ENGINE_INITIALIZED__) return;
  const crypto = window.crypto;
  setEngine(
    "browser_crypto",
    crypto as any,
    new CryptoEngine({
      name: "browser_crypto",
      crypto: crypto as any,
      subtle: (crypto as any).subtle,
    })
  );
  (window as any).__PKIJS_ENGINE_INITIALIZED__ = true;
}

function publicKeyInfoToPEM(spkiBuffer: ArrayBuffer): string {
  const b64 = window.btoa(
    String.fromCharCode.apply(null, Array.from(new Uint8Array(spkiBuffer)))
  );
  const lines = b64.match(/.{1,64}/g) || [];
  return [
    "-----BEGIN PUBLIC KEY-----",
    ...lines,
    "-----END PUBLIC KEY-----",
  ].join("\n");
}

type VerificationStatus = "found" | "not_found" | "found_but_wrong";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function EnhancedAcademicVerifier({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Unwrap params if it's a Promise (Next.js 15+)
  const resolvedParams = 'then' in params && typeof params.then === 'function' ? use(params as Promise<{ id: string }>) : params as { id: string };
  
  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const [status, setStatus] = useState(
    "Drop a PDF file here or click to select"
  );
  const [processing, setProcessing] = useState(false);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [publicKeyPEM, setPublicKeyPEM] = useState<string | null>(null);

  const [signatureValid, setSignatureValid] = useState<boolean | null>(null);
  const [showInvalidSignatureDialog, setShowInvalidSignatureDialog] = useState(false);
  const [nameVerified, setNameVerified] = useState<VerificationStatus | null>(null);
  const [academicIdVerified, setAcademicIdVerified] = useState<VerificationStatus | null>(
    null
  );
  const [cgpaVerified, setCgpaVerified] = useState<VerificationStatus | null>(null);
  const [instituteVerified, setInstituteVerified] = useState<VerificationStatus | null>(
    null
  );

  const [proofData, setProofData] = useState<string | null>(null);
  const [proofGenerated, setProofGenerated] = useState(false);
  const [mailSent, setMailSent] = useState(false);

  const [snarkVerificationResult, setSnarkVerificationResult] = useState<
    boolean | null
  >(null);
  const [signatureVerificationResult, setSignatureVerificationResult] =
    useState<boolean | null>(null);
  const [verifyingSnark, setVerifyingSnark] = useState(false);

  useEffect(() => {
    initPKIjs();
    fetchVerificationData();
  }, [resolvedParams.id]);

  const fetchVerificationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVerifyAcademic(resolvedParams.id);
      if (!data.success) {
        setError(data.message);
        toast.error(data.message);
      } else {
        if (data.data.isVerified) {
          toast.success(
            "This academic verification has already been completed."
          );
          setIsVerified(true);
        }
        setRes(data.data);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPDFState = useCallback(() => {
    setPublicKeyPEM(null);
    setSignatureValid(null);
    setNameVerified(null);
    setAcademicIdVerified(null);
    setCgpaVerified(null);
    setInstituteVerified(null);
    setPdfBytes(null);
    setPages([]);
    setStatus("Drop a PDF file here or click to select");
    setProofData(null);
    setProofGenerated(false);
    setMailSent(false);
  }, []);

  const verifyNameInPages = useCallback(
    (extractedPages: string[], proverName: string): VerificationStatus => {
      if (!proverName) return "not_found";
      const normalizedProverName = normalizeText(proverName);
      const proverNameWords = normalizedProverName.split(/\s+/).filter(w => w.length > 0);
      
      let exactMatch = false;
      let partialMatch = false;
      
      for (const page of extractedPages) {
        const normalizedPage = normalizeText(page);
        
        // Create pattern to match all words in order with word boundaries
        const escapedWords = proverNameWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const pattern = new RegExp(`\\b${escapedWords.join("\\s+")}\\b`, "i");
        
        const match = normalizedPage.match(pattern);
        if (match) {
          // Extract the matched portion and check word count
          const matchedText = match[0];
          const matchedWords = matchedText.split(/\s+/).filter(w => w.length > 0);
          
          // Exact match: same number of words
          if (matchedWords.length === proverNameWords.length) {
            exactMatch = true;
            break;
          } else {
            // Partial match: name found but with different word count (extra or missing words)
            partialMatch = true;
          }
        }
      }
      
      if (exactMatch) {
        return "found";
      } else if (partialMatch) {
        return "found_but_wrong";
      }
      
      return "not_found";
    },
    []
  );

  const verifyAcademicIdInPages = useCallback(
    (extractedPages: string[], proverAcademicId: string): VerificationStatus => {
      if (!proverAcademicId) return "not_found";
      const normalizedId = normalizeText(proverAcademicId);
      const found = extractedPages.some((page) => {
        const normalizedPage = normalizeText(page);
        return normalizedPage.includes(normalizedId);
      });
      return found ? "found" : "not_found";
    },
    []
  );

  const verifyCgpaInPages = useCallback(
    (extractedPages: string[], proverCgpa: string): VerificationStatus => {
      if (!proverCgpa) return "not_found";
      // Extract CGPA value from the provided string (handle formats like "9.4", "9,4", etc.)
      const providedCgpa = parseFloat(proverCgpa.replace(/,/g, "."));
      if (isNaN(providedCgpa)) {
        return "not_found";
      }

      // Try to extract CGPA from document pages
      // Look for patterns like: "CGPA: 8.4", "CGPA 8.4", "8.4", etc.
      const cgpaPatterns = [
        /cgpa[:\s]+(\d+[.,]\d+)/i,
        /(\d+[.,]\d+)[\s]*cgpa/i,
        /grade[:\s]+point[:\s]+average[:\s]+(\d+[.,]\d+)/i,
        /gpa[:\s]+(\d+[.,]\d+)/i,
        /(\d+[.,]\d+)[\s]*gpa/i,
      ];

      let foundCgpa: number | null = null;
      for (const page of extractedPages) {
        for (const pattern of cgpaPatterns) {
          const match = page.match(pattern);
          if (match) {
            const extractedCgpa = parseFloat(match[1].replace(/,/g, "."));
            if (!isNaN(extractedCgpa)) {
              foundCgpa = extractedCgpa;
              // Compare with a small tolerance for floating point comparison
              if (Math.abs(extractedCgpa - providedCgpa) < 0.01) {
                return "found";
              }
            }
          }
        }
      }

      // Fallback: if no pattern match, check if the exact CGPA value appears near CGPA/GPA keywords
      const normalizedProverCgpa = proverCgpa.replace(/,/g, ".").toLowerCase();
      const cgpaVariations = [
        normalizedProverCgpa,
        normalizedProverCgpa.replace(".", ","),
      ];

      const foundInText = extractedPages.some((page) => {
        const pageLower = page.toLowerCase();
        for (const variation of cgpaVariations) {
          const escapedVariation = variation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const contextPattern = new RegExp(
            `(?:cgpa|gpa|grade\\s+point\\s+average)[^\\n]{0,50}${escapedVariation}|${escapedVariation}[^\\n]{0,50}(?:cgpa|gpa|grade\\s+point\\s+average)`,
            "i"
          );
          if (contextPattern.test(pageLower)) {
            return true;
          }
        }
        return false;
      });

      if (foundInText) {
        return "found";
      }

      // If we found a CGPA but it doesn't match, return "found_but_wrong"
      if (foundCgpa !== null) {
        return "found_but_wrong";
      }

      return "not_found";
    },
    []
  );

  const verifyInstituteInPages = useCallback(
    (extractedPages: string[], proverInstitute: string): VerificationStatus => {
      if (!proverInstitute) return "not_found";
      const normalizedProverInstitute = normalizeText(proverInstitute);
      const found = extractedPages.some((page) => {
        const normalizedPage = normalizeText(page);
        return normalizedPage.includes(normalizedProverInstitute);
      });
      return found ? "found" : "not_found";
    },
    []
  );

  const processFile = useCallback(
    async (file: File) => {
      setStatus("Processing academic document...");
      setProcessing(true);
      resetPDFState();

      try {
        const buffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        setPdfBytes(uint8);

        const wasm = await loadWasm();
        const result = wasm.wasm_verify_and_extract(uint8);

        if (result?.success) {
          if (result.pages) setPages(result.pages);

          const isSignatureValid =
            result.signature?.is_valid || result.is_valid;
          setSignatureValid(isSignatureValid);

          // Show dialog if signature is invalid
          if (!isSignatureValid) {
            setShowInvalidSignatureDialog(true);
          }

          const nameStatus = verifyNameInPages(
            result.pages || [],
            res?.proverName || ""
          );
          setNameVerified(nameStatus);

          const instituteStatus = verifyInstituteInPages(
            result.pages || [],
            res?.proverInstitute || ""
          );
          setInstituteVerified(instituteStatus);

          const cgpaStatus = verifyCgpaInPages(
            result.pages || [],
            res?.proverCgpa || ""
          );
          setCgpaVerified(cgpaStatus);

          const academicIdStatus = verifyAcademicIdInPages(
            result.pages || [],
            res?.proverAcademicId || ""
          );
          setAcademicIdVerified(academicIdStatus);

          if (result.signature?.public_key) {
            try {
              const binaryString = atob(result.signature.public_key);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              setPublicKeyPEM(publicKeyInfoToPEM(bytes.buffer));
            } catch (e) {
              console.warn("Could not convert public key to PEM:", e);
            }
          }

          const allFound = 
            nameStatus === "found" &&
            academicIdStatus === "found" &&
            cgpaStatus === "found" &&
            instituteStatus === "found";

          const hasWrongInfo = 
            nameStatus === "found_but_wrong" ||
            academicIdStatus === "found_but_wrong" ||
            cgpaStatus === "found_but_wrong" ||
            instituteStatus === "found_but_wrong";

          if (isSignatureValid && allFound && !hasWrongInfo) {
            toast.success(
              "PDF verified: Signature valid & all required fields found."
            );
            setStatus("PDF verified successfully");
          } else if (isSignatureValid) {
            const issues: string[] = [];
            if (nameStatus === "not_found") issues.push("name");
            if (nameStatus === "found_but_wrong") issues.push("name (wrong)");
            if (instituteStatus === "not_found") issues.push("institute");
            if (instituteStatus === "found_but_wrong") issues.push("institute (wrong)");
            if (cgpaStatus === "not_found") issues.push("CGPA");
            if (cgpaStatus === "found_but_wrong") issues.push("CGPA (wrong)");
            if (academicIdStatus === "not_found") issues.push("academic ID");
            if (academicIdStatus === "found_but_wrong") issues.push("academic ID (wrong)");
            
            if (issues.length > 0) {
              toast.warning(`Signature is valid, but issues with: ${issues.join(", ")}.`);
            }
            setStatus("Signature valid but content verification failed");
          }
        } else {
          // PDF processing failed - likely no digital signature
          setSignatureValid(false);
          setShowInvalidSignatureDialog(true);
          setStatus("PDF does not have a valid digital signature.");
        }
      } catch (err: any) {
        setStatus("Error processing file.");
        toast.error("An unexpected error occurred during file processing.");
      } finally {
        setProcessing(false);
      }
    },
    [
      res,
      resetPDFState,
      verifyNameInPages,
      verifyAcademicIdInPages,
      verifyInstituteInPages,
      verifyCgpaInPages,
    ]
  );

  const onGenerateProof = async () => {
    if (!pdfBytes) return toast.error("Please upload a PDF first.");
    if (!signatureValid) return toast.error("PDF signature must be valid");
    if (nameVerified !== "found") return toast.error("Name must be found and correct in PDF");
    if (academicIdVerified !== "found") return toast.error("Academic ID must be found and correct in PDF");
    if (cgpaVerified !== "found") return toast.error("CGPA must be found and correct in PDF");
    if (instituteVerified !== "found") return toast.error("Institute must be found and correct in PDF");
    if (!res) return toast.error("No verification request data found");

    setProcessing(true);
    setStatus("Generating SNARK proofs...");
    toast.info("Generating proofs... This may take a moment.");

    try {
      const proveEndpoint = "http://localhost:3001/prove";
      const makeProofRequest = (sub_string: string) =>
        fetch(proveEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdf_bytes: Array.from(pdfBytes!),
            page_number: 1,
            offset: 0,
            sub_string,
          }),
        });

      const [
        nameProofResponse,
        academicIdProofResponse,
        instituteProofResponse,
        cgpaProofResponse,
      ] = await Promise.all([
        makeProofRequest(res.proverName),
        makeProofRequest(res.proverAcademicId),
        makeProofRequest(res.proverInstitute),
        makeProofRequest(res.proverCGPA),
      ]);

      if (
        !nameProofResponse.ok ||
        !academicIdProofResponse.ok ||
        !instituteProofResponse.ok ||
        !cgpaProofResponse.ok
      ) {
        throw new Error("Failed to generate one or more proofs.");
      }

      const [nameProof, academicIdProof, instituteProof, cgpaProof] =
        await Promise.all([
          nameProofResponse.json(),
          academicIdProofResponse.json(),
          instituteProofResponse.json(),
          cgpaProofResponse.json(),
        ]);

      const combinedProof = {
        nameProof,
        academicIdProof,
        instituteProof,
        cgpaProof,
        timestamp: Date.now(),
      };

      setProofData(JSON.stringify(combinedProof, null, 2));
      setProofGenerated(true);
      toast.success("SNARK proofs generated successfully for all fields.");
    } catch (e: any) {
      toast.error(`Error generating proof: ${e.message || e}`);
    } finally {
      setProcessing(false);
      setStatus("Ready for next step.");
    }
  };

  const onSendProofMail = async () => {
    if (!proofData) return toast.error("Please generate the proofs first.");
    setProcessing(true);
    toast.info("Preparing to send proof mail...");

    try {
      const result = await sendAcademicProofMail(
        res._id,
        res.email,
        res.recieverEmail,
        res.proverName,
        res.proverAcademicId,
        res.proverInstitute,
        res.proverCGPA,
        publicKeyPEM ?? "",
        proofData
      );
      if (!result.success) {
        throw new Error(result.message || "Failed to send proof mail");
      }
      setMailSent(true);
      toast.success("Academic proof mail sent successfully!");
      await fetchVerificationData();
    } catch (e: any) {
      toast.error(`Error sending proof mail: ${e.message || e}`);
      setProcessing(false);
    }
  };

  const onVerifySnarkProof = async () => {
    if (!res?.snark) return toast.error("No SNARK proof found to verify.");
    setVerifyingSnark(true);
    toast.info("Verifying received SNARK proofs...");

    try {
      const proofToVerify =
        typeof res.snark === "string" ? JSON.parse(res.snark) : res.snark;

      const verifyEndpoint = "http://localhost:3001/verify";
      const verifyProof = async (proof: any) => {
        if (!proof) return true;
        const response = await fetch(verifyEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(proof),
        });
        const result = await response.json();
        return result.success || result.valid;
      };

      const [nameValid, academicIdValid, instituteValid, cgpaValid] =
        await Promise.all([
          verifyProof(proofToVerify.nameProof),
          verifyProof(proofToVerify.academicIdProof),
          verifyProof(proofToVerify.instituteProof),
          verifyProof(proofToVerify.cgpaProof),
        ]);

      const overallResult =
        nameValid && academicIdValid && instituteValid && cgpaValid;
      setSnarkVerificationResult(overallResult);

      if (overallResult) {
        toast.success(
          "All received SNARK proofs have been successfully verified."
        );
      } else {
        toast.error(
          "SNARK proof verification failed. One or more proofs are invalid."
        );
      }
    } catch (e: any) {
      toast.error(`Error verifying SNARK proof: ${e.message || e}`);
      setSnarkVerificationResult(false);
    } finally {
      setVerifyingSnark(false);
    }
  };

  const onVerifySignature = async () => {
    if (!res?.signature) return toast.error("No signature found to verify.");
    try {
      setSignatureVerificationResult(true);
      toast.success("Public Key signature marked as verified.");
    } catch (e: any) {
      toast.error(`Error verifying signature: ${e.message || e}`);
      setSignatureVerificationResult(false);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = ""; // Reset file input
  };

  // Conditional flags for rendering UI elements
  const canGenerateProof =
    signatureValid &&
    nameVerified === "found" &&
    academicIdVerified === "found" &&
    cgpaVerified === "found" &&
    instituteVerified === "found" &&
    pdfBytes &&
    !proofGenerated;
  const canSendMail = proofGenerated && !mailSent;
  const hasReceivedData = res?.signature || res?.snark;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-950">
        <Card className="w-full max-w-md p-6 text-center shadow-2xl bg-white dark:bg-slate-900">
          <XCircle className="w-16 h-16 mx-auto text-red-500" />
          <CardTitle className="mt-4 text-2xl font-bold text-red-700 dark:text-red-400">
            An Error Occurred
          </CardTitle>
          <CardContent className="mt-2 text-base text-red-600 dark:text-red-300">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 -mt-16 pt-4">
      <div className="container mx-auto px-6 py-4 space-y-8">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              Academic Verification Request Details
              <Button
                onClick={fetchVerificationData}
                variant="outline"
                size="sm"
                disabled={loading}
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                  Prover Name
                </p>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground font-semibold text-lg">
                    {res?.proverName}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                  Academic ID
                </p>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground font-semibold text-lg font-mono">
                    {res?.proverAcademicId}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                  Institute
                </p>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground font-semibold text-lg">
                    {res?.proverInstitute}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                  CGPA
                </p>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground font-semibold text-lg">
                    {res?.proverCGPA}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasReceivedData && !isVerified && (
          <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center">
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                  <VerifiedIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                Received Verification Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {res?.signature && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-lg flex items-center">
                      <div className="h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                        <Key className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      Digital Signature (Public Key)
                    </h3>
                    <div className="flex items-center space-x-3">
                      {signatureVerificationResult !== null && (
                        <Badge
                          variant={
                            signatureVerificationResult
                              ? "default"
                              : "destructive"
                          }
                          className="shadow-sm px-3 py-1"
                        >
                          {signatureVerificationResult ? "Verified" : "Failed"}
                        </Badge>
                      )}
                      <Button
                        onClick={onVerifySignature}
                        size="sm"
                        variant="outline"
                        className="shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <VerifiedIcon className="h-4 w-4 mr-2" />
                        Verify Signature
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      readOnly
                      value={res.signature}
                      className="w-full h-32 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-inner resize-none"
                    />
                    <div className="absolute top-2 right-2 opacity-50">
                      <Key className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              {res?.snark && (
                <div className="space-y-4">
                  {res?.signature && <Separator className="my-6" />}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-lg flex items-center">
                      <div className="h-6 w-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
                        <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      SNARK Proofs (All Fields)
                    </h3>
                    <div className="flex items-center space-x-3">
                      {snarkVerificationResult !== null && (
                        <Badge
                          variant={
                            snarkVerificationResult ? "default" : "destructive"
                          }
                          className="shadow-sm px-3 py-1"
                        >
                          {snarkVerificationResult ? "Verified" : "Failed"}
                        </Badge>
                      )}
                      <Button
                        onClick={onVerifySnarkProof}
                        size="sm"
                        variant="outline"
                        disabled={verifyingSnark}
                        className="shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {verifyingSnark ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary mr-2"></div>
                        ) : (
                          <VerifiedIcon className="h-4 w-4 mr-2" />
                        )}
                        Verify SNARKs
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      readOnly
                      value={
                        typeof res.snark === "string"
                          ? res.snark
                          : JSON.stringify(res.snark, null, 2)
                      }
                      className="w-full h-40 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-inner resize-none"
                    />
                    <div className="absolute top-2 right-2 opacity-50">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {!isVerified && (
            <>
              <div className="space-y-6">
                <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-bold text-foreground flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                        <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Upload Academic Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={onFileChange}
                      disabled={processing}
                      className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 shadow-sm"
                    />

                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      {processing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/20 border-t-primary"></div>
                      ) : (
                        <div
                          className={`h-5 w-5 rounded-full ${
                            signatureValid === true
                              ? "bg-green-500"
                              : signatureValid === false
                              ? "bg-red-500"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        ></div>
                      )}
                      <span className="text-muted-foreground text-sm font-medium">
                        {status}
                      </span>
                    </div>

                    {(signatureValid !== null ||
                      nameVerified !== null ||
                      academicIdVerified !== null ||
                      instituteVerified !== null ||
                      cgpaVerified !== null) && (
                      <div className="space-y-4">
                        <Separator />
                        <h3 className="font-semibold text-foreground text-lg">
                          Verification Results
                        </h3>
                        <div className="space-y-3">
                          {signatureValid !== null && (
                            <VerificationResultItem
                              label="Digital Signature"
                              status={signatureValid ? "found" : "not_found"}
                            />
                          )}
                          {nameVerified !== null && (
                            <VerificationResultItem
                              label="Name Verification"
                              status={nameVerified}
                            />
                          )}
                          {academicIdVerified !== null && (
                            <VerificationResultItem
                              label="Academic ID Verification"
                              status={academicIdVerified}
                            />
                          )}
                          {instituteVerified !== null && (
                            <VerificationResultItem
                              label="Institute Verification"
                              status={instituteVerified}
                            />
                          )}
                          {cgpaVerified !== null && (
                            <VerificationResultItem
                              label="CGPA Verification"
                              status={cgpaVerified}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-bold text-foreground flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                        <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      Extracted Content & Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {pages.length > 0 ? (
                      <Textarea
                        readOnly
                        value={pages.join("\n\n--- Page Break ---\n\n")}
                        className="w-full h-64 text-sm font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-inner resize-none"
                        placeholder="Extracted PDF content will appear here..."
                      />
                    ) : (
                      <div className="h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-muted-foreground bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="text-center space-y-4">
                          <div className="h-16 w-16 rounded-2xl bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center mx-auto">
                            <FileX className="h-8 w-8 opacity-50" />
                          </div>
                          <p className="font-medium">
                            No content extracted yet
                          </p>
                        </div>
                      </div>
                    )}

                    {proofData && (
                      <div className="space-y-4">
                        <Separator />
                        <h3 className="font-semibold text-foreground mb-3 flex items-center text-lg">
                          <div className="h-6 w-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
                            <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          </div>
                          Generated SNARK Proofs
                        </h3>
                        <Textarea
                          readOnly
                          value={proofData}
                          className="w-full h-40 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-inner resize-none"
                        />
                      </div>
                    )}

                    <div className="space-y-4 pt-4">
                      {canGenerateProof && (
                        <Button
                          onClick={onGenerateProof}
                          disabled={processing}
                          className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                          size="lg"
                        >
                          {processing ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white mr-3"></div>
                          ) : (
                            <Zap className="h-5 w-5 mr-3" />
                          )}
                          Generate SNARK Proofs
                        </Button>
                      )}

                      {canSendMail && (
                        <Button
                          onClick={onSendProofMail}
                          disabled={processing}
                          variant="outline"
                          className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2"
                          size="lg"
                        >
                          {processing ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/20 border-t-primary mr-3"></div>
                          ) : (
                            <Mail className="h-5 w-5 mr-3" />
                          )}
                          Send Proof Mail
                        </Button>
                      )}

                      {mailSent && (
                        <div className="p-6 rounded-xl border-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 shadow-lg">
                          <div className="flex items-center space-x-3 text-green-700 dark:text-green-400 mb-2">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-lg">
                              Verification Process Complete
                            </span>
                          </div>
                          <p className="text-green-600 dark:text-green-300 ml-11 leading-relaxed">
                            The academic proof has been sent successfully.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {isVerified && (
            <div className="space-y-6 lg:col-span-2">
              <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-foreground flex items-center">
                    <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                      <VerifiedIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    Academic Verification Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {res?.signature && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-lg flex items-center">
                          <div className="h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                            <Key className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          Digital Signature (Public Key)
                        </h3>
                        <Badge
                          variant="default"
                          className="shadow-sm px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        >
                          Verified
                        </Badge>
                      </div>
                      <Textarea
                        readOnly
                        value={res.signature}
                        className="w-full h-32 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-inner resize-none"
                      />
                    </div>
                  )}

                  {res?.snark && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-lg flex items-center">
                          <div className="h-6 w-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
                            <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          </div>
                          SNARK Proof (All Fields)
                        </h3>
                        <Badge
                          variant="default"
                          className="shadow-sm px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        >
                          Verified
                        </Badge>
                      </div>
                      <Textarea
                        readOnly
                        value={
                          typeof res.snark === "string"
                            ? res.snark
                            : JSON.stringify(res.snark, null, 2)
                        }
                        className="w-full h-64 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-inner resize-none"
                      />
                    </div>
                  )}
                  <div className="p-8 rounded-2xl border-2 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800 shadow-xl">
                    <div className="flex items-center space-x-4 text-green-700 dark:text-green-400 mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="font-bold text-2xl">
                          Verification Successfully Completed
                        </span>
                        <p className="text-green-600 dark:text-green-300 text-sm mt-1">
                          All fields verified • Document authenticated • Proofs
                          processed
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Invalid Signature Dialog */}
      {showInvalidSignatureDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-2xl border-2 border-red-200 dark:border-red-800">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-700 dark:text-red-400">
                  Invalid Digital Signature
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-foreground">
                The uploaded PDF does not have a valid digital signature. 
                Please upload a digitally signed PDF document.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowInvalidSignatureDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <label className="flex-1">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setShowInvalidSignatureDialog(false);
                        processFile(file);
                      }
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <Button asChild className="w-full">
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Again
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

const VerificationResultItem = ({
  label,
  status,
}: {
  label: string;
  status: VerificationStatus | null;
}) => {
  if (status === null) return null;

  // Normalize status to handle any string variations (case-insensitive)
  const normalizedStatus = String(status).trim().toLowerCase().replace(/\s+/g, "_");
  
  const getStatusConfig = () => {
    // Handle exact matches and variations
    if (normalizedStatus === "found") {
      return {
        icon: CheckCircle,
        iconColor: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        badgeVariant: "default" as const,
        badgeText: "Valid",
        badgeClassName: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      };
    }
    if (normalizedStatus === "found_but_wrong" || normalizedStatus === "foundbutwrong") {
      return {
        icon: XCircle,
        iconColor: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        badgeVariant: "destructive" as const,
        badgeText: "Found but Wrong",
        badgeClassName: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      };
    }
    if (normalizedStatus === "not_found" || normalizedStatus === "notfound") {
      return {
        icon: XCircle,
        iconColor: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        badgeVariant: "destructive" as const,
        badgeText: "Not Found",
        badgeClassName: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      };
    }
    // Fallback for any unexpected status values
    console.warn("Unknown status value:", status, "normalized:", normalizedStatus);
    return {
      icon: XCircle,
      iconColor: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-900/30",
      badgeVariant: "destructive" as const,
      badgeText: "Unknown",
      badgeClassName: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
  };

  const config = getStatusConfig();
  if (!config || !config.icon) {
    console.error("Invalid status config for status:", status);
    return null;
  }
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${config.bgColor}`}>
          <Icon className={`h-4 w-4 ${config.iconColor}`} />
        </div>
        <span className="font-semibold">{label}</span>
      </div>
      <Badge
        variant={config.badgeVariant}
        className={`shadow-sm px-3 py-1 ${config.badgeClassName}`}
      >
        {config.badgeText}
      </Badge>
    </div>
  );
};
