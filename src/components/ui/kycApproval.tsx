import { useSignTypedData } from "wagmi";
import { Button } from "./button";
import { useApi } from "@/hooks";
import { useEffect, useState } from "react";
import { env } from "@/env";
import { PRIMARY_TYPE, createApprovalTypes, createDomain, createMessage } from "@/lib/utils";
import { KycProps } from "@/types/kyc";

export default function KycApproval({ isConnected, chainId, clientId, repoName, repoOwner, version, onError }: KycProps) {
  const showButton = isConnected && repoName && clientId && repoOwner;
  const { signTypedDataAsync, data } = useSignTypedData();
  const { apiPost } = useApi();

  const [message, setMessage] = useState(createMessage(clientId, repoName, repoOwner));
  const [domain, setDomain] = useState(createDomain(chainId, version));
  const [approvalTypes, setApprovalTypes] = useState(createApprovalTypes());

  useEffect(() => {
    setMessage(createMessage(clientId, repoName, repoOwner));
    setDomain(createDomain(chainId, version));
    setApprovalTypes(createApprovalTypes());
  }, []);

  useEffect(() => {
    const submitKyc = async () => {
      if (data) {
        try {
          await apiPost(`${env.NEXT_PUBLIC_BACKEND_API_URL}/application/submit_kyc`, {
            message,
            signature: data
          });
        } catch (e) {
          onError("Failed to submit KYC");
          console.error(e);
        }
      }
    };

    submitKyc();
  }, [data]);

  const handleClick = () => {
    console.log(message);
    signTypedDataAsync({
      domain,
      types: approvalTypes,
      primaryType: PRIMARY_TYPE,
      message
    });
  };
  return (
    showButton && (
      <Button className="mx-auto" onClick={handleClick}>
        Share and submit passport
      </Button>
    )
  );
}
