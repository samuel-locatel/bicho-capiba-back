import Animal from '#models/animal';
import Ong from '#models/ong';
import User from '#models/user';
import File from '#models/file';
import Especie from '#models/especie';
import Raca from '#models/raca';
import Cor from '#models/cor';
import Vacina from '#models/vacina';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

export default class SeedData extends BaseSeeder {
  public async run() {
    const ongs = await Ong.createMany([
      {
        nome: 'ONG Esperança',
        cnpj: '12345678000101',
        email: 'ong@gmail.com',
        telefone: '81987654321',
        descricao: 'ONG dedicada ao resgate de animais.',
        cep: '51011000',
        quantidadeAnimais: 50,
        responsavelTecnico: 'Maria Silva',
        password: 'secret123',
        bairro: 'Boa Viagem',
        rua: 'Rua das Flores',
        numero: '123',
        cidade: 'Recife',
        estado: 'PE',
        complemento: null,
        latitude: '-8.119000',
        longitude: '-34.902000',
      },
      {
        nome: 'Amigos dos Animais',
        cnpj: '98765432000199',
        email: 'contato@amigosanimais.org',
        telefone: '81976543210',
        descricao: 'Cuidamos de animais abandonados.',
        cep: '52060000',
        quantidadeAnimais: 30,
        responsavelTecnico: 'João Santos',
        password: 'secret123',
        bairro: 'Casa Forte',
        rua: 'Rua 2',
        numero: '456',
        cidade: 'Recife',
        estado: 'PE',
        complemento: null,
        latitude: '-8.037000',
        longitude: '-34.919000',
      },
      {
        nome: 'Vida Animal',
        cnpj: '11223344000155',
        email: 'contato@vidaanimal.org',
        telefone: '81965432109',
        descricao: 'Promovemos adoção responsável.',
        cep: '52020000',
        quantidadeAnimais: 40,
        responsavelTecnico: 'Ana Costa',
        password: 'secret123',
        bairro: 'Espinheiro',
        rua: 'Rua 3',
        numero: '789',
        cidade: 'Recife',
        estado: 'PE',
        complemento: null,
        latitude: '-8.046000',
        longitude: '-34.897000',
      },
    ]);

    const users = await User.createMany([
      {
        fullName: 'José Vinicius do Carmo de Andrade',
        email: 'ze@gmail.com',
        telefone: '11999999999',
        password: 'secret123',
        cpf: '12345678901',
        bairro: 'Centro',
        cidade: 'Recife',
        estado: 'PE',
        cep: '50010000',
        complemento: null,
        rua: 'Rua Nova',
      },
      {
        fullName: 'Fernanda Lima',
        email: 'fernanda.lima@example.com',
        telefone: '21999999999',
        password: 'secret123',
      },
      {
        fullName: 'Rafael Souza',
        email: 'rafael.souza@example.com',
        telefone: '31999999999',
        password: 'secret123',
      },
    ]);

    console.log(`Created ${users.length} users.`);

    // Criar dados de apoio: cores, especies, racas e vacinas
    const coresData = [
      { nome: 'Preto', hexadecimal: '#000000' },
      { nome: 'Branco', hexadecimal: '#FFFFFF' },
      { nome: 'Marrom', hexadecimal: '#8B4513' },
      { nome: 'Caramelo', hexadecimal: '#D2691E' },
      { nome: 'Cinza', hexadecimal: '#808080' },
      { nome: 'Dourado', hexadecimal: '#FFD700' },
      { nome: 'Amarelo', hexadecimal: '#FFFF00' },
      { nome: 'Laranja', hexadecimal: '#FF8C00' },
      { nome: 'Vermelho', hexadecimal: '#FF0000' },
      {
        nome: 'Tricolor',
        hexadecimal: 'linear-gradient(45deg, #8B4513, #FFFFFF, #000000)',
      },
      { nome: 'Rajado', hexadecimal: 'linear-gradient(45deg, #8B4513, #D2691E)' },
      { nome: 'Malhado', hexadecimal: 'linear-gradient(45deg, #FFFFFF, #000000)' },
      { nome: 'Outros', hexadecimal: '#9CA3AF' },
    ];

    const createdCores: any[] = await Cor.createMany(coresData as any);

    const especiesNames = ['Coelho', 'Gato', 'Cachorro', 'Equino', 'Roedor'];
    const createdEspecies: any[] = await Especie.createMany(
      especiesNames.map((nome) => ({ nome })) as any
    );

    // Map name -> id (number) for convenience
    const especieIdByName: Record<string, number> = {};
    for (const e of createdEspecies) {
      especieIdByName[(e as any).nome] = Number((e as any).id);
    }

    const racasPorEspecieSeed: Record<string, string[]> = {
      Cachorro: [
        'Sem Raça Definida',
        'Akita',
        'Beagle',
        'Border Collie',
        'Boxer',
        'Bulldog Francês',
        'Bulldog Inglês',
        'Chihuahua',
        'Cocker Spaniel',
        'Dachshund',
        'Dálmata',
        'Doberman',
        'Fila Brasileiro',
        'Golden Retriever',
        'Husky Siberiano',
        'Labrador',
        'Lhasa Apso',
        'Maltês',
        'Pastor Alemão',
        'Pinscher',
        'Pitbull',
        'Poodle',
        'Pug',
        'Rottweiler',
        'Schnauzer',
        'Shih Tzu',
        'Yorkshire',
        'Outra Raça',
      ],
      Gato: [
        'Sem Raça Definida',
        'Angorá',
        'Bengal',
        'Birmanês',
        'British Shorthair',
        'Maine Coon',
        'Persa',
        'Ragdoll',
        'Russo Azul',
        'Sagrado da Birmânia',
        'Siamês',
        'Sphynx',
        'Outra Raça',
      ],
      Equino: ['Mangalarga', 'Puro-sangue', 'Maremano'],
      Roedor: ['Porquinho-da-índia', 'Hamster', 'Rato'],
      Coelho: ['SRD', 'Angorá', 'Rex'],
    };

    const racasToCreate: { nome: string; especie_id: number }[] = [];
    for (const [esp, racas] of Object.entries(racasPorEspecieSeed)) {
      const espId = especieIdByName[esp];
      for (const r of racas) {
        racasToCreate.push({ nome: r, especie_id: espId });
      }
    }

    const createdRacas: any[] = await Raca.createMany(racasToCreate as any);

    const racasByEspecie: Record<string, any[]> = {};
    for (const r of createdRacas) {
      const especieId = Number((r as any).especie_id);
      const especieObj = createdEspecies.find((e) => Number((e as any).id) === especieId);
      const especieNome = especieObj ? (especieObj as any).nome : 'Unknown';
      racasByEspecie[especieNome] = racasByEspecie[especieNome] || [];
      racasByEspecie[especieNome].push(r);
    }

    const corByName: Record<string, any> = {};
    for (const c of createdCores) {
      corByName[(c as any).nome] = c;
    }

    const especies = ['Coelho', 'Gato', 'Cachorro', 'Equino', 'Roedor'];

    const vacinasPossiveis = [
      'Antirrábica',
      'V10',
      'V8',
      'Tétano',
      'Leptospirose',
      'Influenza',
      'Gripe',
      'Completa',
    ];

    const vacinasToCreate: {
      nome: string;
      especie_id: number;
    }[] = [];
    for (const esp of createdEspecies) {
      const espId = Number((esp as any).id);
      for (const v of vacinasPossiveis) {
        vacinasToCreate.push({ nome: v, especie_id: espId });
      }
    }

    await Vacina.createMany(vacinasToCreate as any);

    const idadesPossiveis = ['0.5', '1', '2', '3', '4', '6', '8', '10', '12', '18'];

    // Nomes personalizados para cada animal (um de cada espécie)
    const nomesPersonalizados = ['Fredo', 'Luna', 'Rex', 'Spirit', 'Pipoca'];

    // Histórias detalhadas e extensas para cada animal
    const historiasDetalhadas: string[] = [
      // Fredo o Coelho
      `Fredo foi resgatado em situação de extrema negligência no bairro Boa Viagem, Recife. Quando nossa equipe o encontrou, ele estava confinado em uma caixa minúscula, sem acesso à água limpa ou alimentação adequada. Seu pelo estava emaranhado e sua postura revelava medo profundo. Desde então, Fredo passou por uma transformação incrível em nosso abrigo. Com paciência e cuidados veterinários, ele descobriu a alegria de saltar livremente em um espaço amplo e se aninhar em ninhos macios. Apesar de inicialmente tímido, Fredo hoje demonstra uma curiosidade saudável e se aproxima de tutores pacientes para receber carinhos delicados. Ele adora cenouras frescas e folhas de rúcula, e tem um hábito adorável de fazer 'binkies' (saltos de alegria) quando feliz. Fredo se dá bem com outros coelhos de temperamento calmo, mas aprecia momentos de solitude. Procuramos uma família que entenda suas necessidades específicas: espaço seguro para explorar, dieta balanceada com feno de qualidade, e muita paciência para continuar construindo sua confiança. Ele é ideal para tutores que desejam um companheiro tranquilo e observador, capaz de formar laços profundos com aqueles que respeitam seu ritmo. Fredo merece um lar onde possa finalmente experimentar a segurança e o amor que lhe foram negados por tanto tempo.`,

      // Luna a Gata
      `Luna foi resgatada das ruas do bairro Casa Forte, Recife, durante uma noite de chuva torrencial. Ela estava escondida sob um carro, faminta e com um olho infectado que exigiu cuidados veterinários imediatos. Nossa equipe a trouxe para o abrigo, onde ela recebeu tratamento intensivo e muito carinho. Inicialmente desconfiada, Luna demorou semanas para permitir que alguém a tocasse, mas hoje ela é uma gata que ronrona alto e pede carinhos com cabeçadas suaves. Luna tem aproximadamente 2 anos e desenvolveu uma personalidade única: ela é independente mas ama companhia, brincalhona mas respeita seus momentos de descanso. Adora caçar brinquedos de penas, dormir em locais altos e observar o mundo pela janela. Luna se socializa bem com outros gatos, especialmente os mais calmos, e tolera cães de pequeno porte desde que devidamente apresentados. Ela é perfeita para um lar que aprecie a dualidade de um felino: companheira presente que também valoriza seu espaço pessoal. Luna está castrada, vacinada e pronta para oferecer anos de cumplicidade e momentos de pura fofura à sua nova família. Procuramos adotantes que entendam a jornada de resiliência dela e estejam comprometidos com um relacionamento baseado em paciência e respeito mútuo.`,

      // Rex o Cachorro
      `Rex foi encontrado vagando desorientado pelas ruas do bairro Aflitos, Recife, com sinais evidentes de abandono e subnutrição. Seu pelo estava encardido, seus olhos tristes revelavam a confusão de um cão que um dia soube o que era ter um lar. Apesar do trauma, Rex nunca perdeu sua capacidade de amar. Desde o resgate, ele se transformou no cão mais grato e leal que já tivemos em nosso abrigo. Rex tem aproximadamente 4 anos e é um cão de porte médio com uma energia equilibrada. Adora passeios matinais, aprender novos comandos (é muito inteligente!) e receber abraços apertados. Seu rabo não para de balançar quando vê pessoas, e ele tem um talento especial para consolar quem está triste. Rex se dá bem com crianças respeitosas, outros cães sociáveis e até gatos curiosos. Ele é castrado, vacinado e tem um histórico de saúde impecável. Procuramos uma família ativa que possa incluí-lo em aventuras ao ar livre, mas que também valorize momentos de conexão tranquila no sofá. Rex tem muito amor para dar e promete ser o companheiro mais fiel que você poderia desejar - seu olhar de gratidão diz tudo o que suas palavras não podem expressar. Ele merece um lar definitivo onde possa envelhecer com dignidade e carinho.`,

      // Spirit o Cavalo
      `Spirit é um cavalo de aproximadamente 8 anos que foi resgatado de uma propriedade rural próxima ao bairro Boa Vista, Recife, onde vivia em condições de maus-tratos. Ele foi encontrado em um piquete sem sombra, com água suja e pouca alimentação, seu corpo magro revelava longos períodos de negligência. Spirit, no entanto, carrega uma dignidade indescritível em seu porte. Desde sua recuperação em nosso santuário, ele revelou ser um equino de temperamento dócil, inteligente e profundamente sensível. Spirit se conecta com humanos que demonstram calma e respeito, respondendo bem a tratamento baseado em reforço positivo. Ele tem uma andadura suave e aprecia caminhadas em trilhas tranquilas, mostrando-se curioso sobre o ambiente sem ser assustadiço. Spirit convive bem com outros equinos e mulas, estabelecendo hierarquia de forma pacífica. Recomendamos um lar com experiência em cuidados equinos, espaço adequado (piquete com pasto e abrigo), e comprometimento com sua dieta balanceada e cuidados veterinários regulares. Spirit não é adequado para trabalho pesado, mas pode ser um parceiro maravilhoso para atividades de lazer e terapia equina. Seu olhar expressa uma sabedoria adquirida através da adversidade, e ele busca alguém que veja além de sua história difícil para o coração nobre que ele possui. Adotar Spirit é um compromisso sério, mas recompensador para aqueles que entendem a majestade e as necessidades específicas dos equinos.`,

      // Pipoca o Porquinho-da-índia
      `Pipoca é um porquinho-da-índia de aproximadamente 1 ano, resgatado de um apartamento no bairro Tamarineira, Recife, onde vivia em uma gaiola minúscula sem ventilação adequada. Sua família original o abandonou quando se mudou, deixando-o para trás sem comida ou água. Nossa equipe o encontrou após denúncia de vizinhos que ouviam seus chamados angustiados. Desde então, Pipoca se transformou em um roedor vibrante e cheio de personalidade. Ele adora explorar seus túneis de papelão, aprender truques simples para ganhar cenoura, e receber carinhos na barriga quando confia em seu tutor. Pipoca tem uma vocalização única: ele 'cui cui' quando excitado e ronrona suavemente quando relaxado. É social com outros porquinhos-da-índia e se beneficia de companhia da mesma espécie. Recomendamos que seja adotado em dupla ou para quem já tenha outro porquinho. Pipoca requer espaço adequado (gaiola de pelo menos 120cm), dieta rica em vitamina C, e estimulação mental diária. Ele é ideal para famílias com crianças que aprendem responsabilidade, ou adultos que apreciam animais pequenos com grandes personalidades. Adotar Pipoca significa comprometer-se com sua expectativa de vida de 5-7 anos, fornecendo cuidados específicos e muito amor em miniatura. Ele prova que o tamanho físico não limita a capacidade de conquistar corações.`,
    ];

    const animals = await Animal.createMany(
      Array.from({ length: 5 }).map((_, index) => {
        const especie = especies[index % especies.length];
        const idade = idadesPossiveis[index % idadesPossiveis.length];
        const idadeFloat = parseFloat(idade);
        const yearsMs = Math.floor(idadeFloat * 365 * 24 * 60 * 60 * 1000);
        const nascimento = new Date(Date.now() - yearsMs).toISOString().split('T')[0];

        let porte: 'Pequeno' | 'Medio' | 'Grande' = ['Pequeno', 'Medio', 'Grande'][
          Math.floor(Math.random() * 3)
        ] as 'Pequeno' | 'Medio' | 'Grande';
        if (especie === 'Equino') porte = 'Grande';
        if (especie === 'Roedor') porte = 'Pequeno';

        const racaObjs = racasByEspecie[especie] || [];
        const racaObj =
          racaObjs.length > 0
            ? racaObjs[Math.floor(Math.random() * racaObjs.length)]
            : null;

        const corName = ['Preto', 'Branco', 'Marrom', 'Caramelo', 'Cinza'][
          Math.floor(Math.random() * 5)
        ];
        const corObj = corByName[corName];
        const corId = corObj
          ? String((corObj as any).id)
          : String((createdCores[0] as any).id);
        const especieId = especieIdByName[especie];
        // Ensure raca_id is never null: prefer chosen raca, else first raca for the especie, else first created raca overall
        let racaId: number;
        if (racaObj) {
          racaId = Number((racaObj as any).id);
        } else {
          const fallbackRacas = racasByEspecie[especie] || [];
          if (fallbackRacas.length > 0) {
            racaId = Number((fallbackRacas[0] as any).id);
          } else if (createdRacas.length > 0) {
            racaId = Number((createdRacas[0] as any).id);
          } else {
            // As a last resort, set to 0 (shouldn't happen if seeds ran correctly)
            racaId = 0;
          }
        }

        return {
          nome: nomesPersonalizados[index],
          sexo: (index % 2 === 0 ? 'M' : 'F') as 'M' | 'F',
          porte,
          cor: corName,
          cor_id: corId,
          especie,
          especie_id: especieId,
          raca: racaObj ? (racaObj as any).nome : 'SRD',
          raca_id: racaId,
          statusAnimal: ['Disponivel', 'Adotado', 'Pendente'][
            Math.floor(Math.random() * 3)
          ] as 'Disponivel' | 'Adotado' | 'Pendente',
          ongId: ongs[Math.floor(Math.random() * ongs.length)].id,
          castrado:
            especie === 'Gato' || especie === 'Cachorro' ? Math.random() > 0.3 : null,
          necessidadesEspeciais:
            Math.random() > 0.9 ? 'Requer medicamentos diários' : null,
          historia: historiasDetalhadas[index],
          sociavelAnimal: Math.random() > 0.4,
          sociavelPessoa: Math.random() > 0.4,
          dataNascimento: nascimento,
        };
      })
    );

    const photoUrlsList: string[][] = [
      // Coelho 1
      [
        'https://img.olx.com.br/images/41/414556825681361.webp',
        'https://img.olx.com.br/images/38/384541102844771.webp',
        'https://img.olx.com.br/images/40/402568104545068.webp',
      ],
      // Gato 2
      [
        'https://adotar.com.br/upload/2025-10/animais_imagem1279271.jpg?w=700&format=webp',
        'https://adotar.com.br/upload/2025-10/animais_imagem1279257.jpeg?w=700&format=webp',
        'https://adotar.com.br/upload/2025-10/animais_imagem1279258.jpeg?w=700&format=webp',
      ],
      // Cachorro 3
      [
        'https://adotar.com.br/upload/2024-08/animais_imagem1147686.jpg?w=700&format=webp',
        'https://adotar.com.br/upload/2024-08/animais_imagem1147679.jpg?w=700&format=webp',
        'https://adotar.com.br/upload/2024-08/animais_imagem1147677.jpg?w=700&format=webp',
      ],
      // Equino 4
      [
        'https://img.olx.com.br/images/26/261523349554190.webp',
        'https://img.olx.com.br/images/33/339502344372916.webp',
        'https://img.olx.com.br/images/35/351599702978777.webp',
      ],
      // Roedor 5
      [
        'https://img.olx.com.br/images/47/471525572619343.webp',
        'https://img.olx.com.br/images/52/528507938719798.webp',
        'https://img.olx.com.br/images/49/497596817812559.webp',
      ],
    ];

    for (const [idx, animal] of animals.entries()) {
      const manualUrls = photoUrlsList[idx] || [];
      const hasManual = manualUrls.some((u) => u && u.trim() !== '');

      if (hasManual) {
        // Usar as URLs manuais fornecidas (filtrar vazias)
        for (const url of manualUrls.filter((u) => u && u.trim() !== '')) {
          await File.create({
            url,
            type: 'MEDIA',
            animalId: animal.id,
            ongId: animal.ongId,
            extname: url.split('.').pop() || 'jpg',
          });
        }
      }
    }

    console.log('Seed data created successfully!');
  }
}
