export const LineItemOuterContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="px-4 sm:px-0">
      <div className="max-w-2xl space-y-6">
        <div className="border-l-2 border-gray-300 pl-4 dark:border-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
};

export const LineItemContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="mb-10">{children}</div>;
};

export const LineItemHeading = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <h3 className="mb-2 text-xl font-semibold text-balance">{children}</h3>
  );
};

export const LineItemSubheading = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <p className="mb-3 text-sm text-balance text-gray-600 dark:text-gray-300">
      {children}
    </p>
  );
};

export const LineItemDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <p className="mt-3 text-sm text-balance sm:text-base">{children}</p>;
};
