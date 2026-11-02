# Ícones para home-assistant/brands

O Home Assistant e o HACS mostram o ícone de integrações personalizadas a partir do repositório [home-assistant/brands](https://github.com/home-assistant/brands).

1. Faça um fork de `home-assistant/brands`.
2. Copie `custom_integrations/homedeck/` deste diretório para `custom_integrations/homedeck/` no fork.
3. Abra um pull request seguindo o modelo do repositório.

Arquivos:

- `icon.png`: 256 × 256, fundo transparente;
- `icon@2x.png`: 512 × 512, fundo transparente;
- `icon.svg`: fonte editável usada para gerar os PNGs.

Depois que o pull request for aceito, remova `ignore: brands` de `.github/workflows/validate.yml`.
