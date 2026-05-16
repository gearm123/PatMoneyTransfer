type RiaTransferMoneyLogoProps = {
  className?: string;
};

export function RiaTransferMoneyLogo({ className = "" }: RiaTransferMoneyLogoProps) {
  return (
    <div className={`ria-logo ${className}`.trim()} aria-label="Ria Money Transfer">
      <span className="ria-logo__mark" aria-hidden>
        ria
      </span>
      <span className="ria-logo__text">
        <span>Money</span>
        <span>Transfer</span>
      </span>
    </div>
  );
}
