import { useCallback, useMemo } from "react";
import { useChainProtocols, WithProjectId } from "@/util/enso";
import { SupportedChainId } from "@/constants";
import { ProjectFilter } from "@/types";
import { List, RowComponentProps } from "react-window";
import { ProtocolData } from "@ensofinance/sdk";
import { Select, SelectOption, Typography } from "@metrom-xyz/ui";

export const capitalize = (str?: string) =>
  str?.slice(0, 1).toUpperCase() + str?.slice(1);

// Simple protocol icon component
const ProtocolIcon = ({ logoUri }: { logoUri?: string }) => (
  <div className="flex items-center justify-center rounded-[50%] overflow-hidden w-7 h-7 mr-2">
    {logoUri && <img src={logoUri} alt="" width={"28px"} height={"28px"} />}
  </div>
);

const ProjectIndicator = ({
  index,
  projects,
  style,
  onClick,
}: RowComponentProps<{
  projects: WithProjectId<ProtocolData>[];
  onClick: (projectSlug: string) => void;
}>) => {
  const project = projects[index];

  const handlePoolOnClick = useCallback(() => {
    onClick(project.slug);
  }, [onClick, project.slug]);

  return (
    <div
      style={style}
      className="flex items-center gap-2 mr-8 rounded-lg"
      onClick={handlePoolOnClick}
    >
      <ProtocolIcon logoUri={project.logosUri[0]} />
      {capitalize(project.projectId)}
    </div>
  );
};

const ProjectSelector = ({
  value,
  onChange,
  chainId,
  disabled,
  projectsFilter,
}: {
  value: string;
  onChange: (value: string) => void;
  chainId?: SupportedChainId;
  disabled?: boolean;
  projectsFilter?: ProjectFilter;
}) => {
  const protocols = useChainProtocols(chainId);
  const projectOptions: SelectOption<string>[] = useMemo(() => {
    if (!protocols) return [{ value: "", label: "" }];

    let availableProjects = protocols;

    if (projectsFilter?.include?.length > 0) {
      availableProjects = availableProjects?.filter((p) =>
        projectsFilter.include.includes(p.projectId)
      );
    }
    if (projectsFilter?.exclude?.length > 0) {
      availableProjects = availableProjects?.filter(
        (p) => !projectsFilter.exclude.includes(p.projectId)
      );
    }

    return availableProjects
      ?.sort((a, b) => a.projectId?.localeCompare(b.projectId))
      .map((project) => ({
        // FIXME: not the best solution
        value: `${project.projectId}_${project.logosUri[0]}`,
        label: project.projectId,
      }));
  }, [protocols, projectsFilter]);

  const onSelectChange = useCallback(
    (option: SelectOption<string>) => {
      onChange(option.value);
    },
    [onChange]
  );

  return (
    <Select
      messages={{ noResults: "Nothing here" }}
      loading={!projectOptions}
      disabled={disabled}
      options={projectOptions}
      value={value}
      search
      onChange={onSelectChange}
      renderOption={(option) => {
        const [, logoUri] = option.value.split("_");

        return (
          <div className="flex items-center gap-2 mr-8 rounded-lg">
            <ProtocolIcon logoUri={logoUri} />
            <Typography
              weight="medium"
              autoCapitalize="on"
              noWrap
              truncate
              className="overflow-hidden max-w-24"
            >
              {option.label}
            </Typography>
          </div>
        );
      }}
    />
  );
};

export default ProjectSelector;
