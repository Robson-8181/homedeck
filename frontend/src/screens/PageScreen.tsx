import { useState } from "react";
import { ContextHeader } from "../components/ContextHeader";
import { EntityCard } from "../components/EntityCard";
import { EntityModal } from "../components/EntityModal";
import type { DiscoveredEntity } from "../types/discovery";
import { usePageContent, type PageRef } from "./pages";
import type { ScreenProps } from "./types";

/** Media, Security, Scenes or a custom page in the grid layout. */
export function PageScreen(props: ScreenProps & { page: PageRef }) {
  const { config, editing, hass, language, t } = props;
  const [modalEntity, setModalEntity] = useState<DiscoveredEntity | null>(null);
  const content = usePageContent(props, props.page);

  return <main className={`screen collection-screen ${editing ? "screen--editing" : ""}`}>
    <ContextHeader config={config} hass={hass} language={language} onSettings={props.onSettings} t={t} />
    <header className="collection-header"><div><span className="eyebrow">{content.count} {t("entities")}</span><h1>{content.title}</h1></div></header>
    {editing && <p className="edit-hint">{t("editHint")}</p>}
    {content.body({ className: "device-grid collection-grid", render: (entity) => <EntityCard entity={entity} hass={hass} language={language} onLongPress={setModalEntity} t={t} />, sizable: true })}
    {modalEntity && <EntityModal entity={modalEntity} hass={hass} language={language} onClose={() => setModalEntity(null)} roomName={content.roomName(modalEntity)} t={t} />}
  </main>;
}
